import { prisma } from '../utils/database';
import { AppError } from '../utils/errorHandler';
import { webSocketService } from '../services/websocket.service';

export const rsvpController = {
  async createRSVP(eventId: string, userId: string, status: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    if (!event.approved) {
      throw new AppError(400, 'Cannot RSVP to unapproved event');
    }

    // Check if RSVP already exists
    const existingRSVP = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    let rsvp;
    if (existingRSVP) {
      // Update existing RSVP
      rsvp = await prisma.rSVP.update({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        },
        data: { status: status as any },
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          },
          event: true
        }
      });
    } else {
      // Create new RSVP
      rsvp = await prisma.rSVP.create({
        data: {
          userId,
          eventId,
          status: status as any
        },
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          },
          event: true
        }
      });
    }

    // Notify event subscribers about RSVP update
    webSocketService.notifyEventSubscribers(eventId, {
      type: 'RSVP_UPDATED',
      data: rsvp
    });

    return {
      message: existingRSVP ? 'RSVP updated successfully' : 'RSVP created successfully',
      rsvp
    };
  },

  async getUserRSVPs(userId: string) {
    const rsvps = await prisma.rSVP.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return rsvps;
  },

  async getEventRSVPs(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    const rsvps = await prisma.rSVP.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return rsvps;
  }
};
