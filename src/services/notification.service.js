import { EventSubject } from '../patterns/observer.js';
import { emailObserver } from './email.service.js';

// Singleton Notification Service using Observer Pattern
class NotificationService extends EventSubject {
  constructor() {
    super();
    this.initializeObservers();
  }

  initializeObservers() {
    // Register all observers
    this.addObserver(emailObserver);
    // You can add more observers here in the future:
    // this.addObserver(new SMSObserver());
    // this.addObserver(new PushNotificationObserver());
    
    console.log('🎯 NotificationService initialized with observers:', this.getObservers());
  }

  // Helper methods for different event types
  async notifyUserRegistered(userEmail, userName) {
    await this.notifyObservers('USER_REGISTERED', {
      userEmail,
      userName
    });
  }

  async notifyEventCreated(userEmail, eventTitle, userName) {
    await this.notifyObservers('EVENT_CREATED', {
      userEmail,
      eventTitle,
      userName
    });
  }

  async notifyEventUpdated(userEmail, eventTitle, userName) {
    await this.notifyObservers('EVENT_UPDATED', {
      userEmail,
      eventTitle,
      userName
    });
  }

  async notifyEventApproved(userEmail, eventTitle, userName) {
    await this.notifyObservers('EVENT_APPROVED', {
      userEmail,
      eventTitle,
      userName
    });
  }

  async notifyRSVPCreated(userEmail, eventTitle, rsvpStatus, userName) {
    await this.notifyObservers('RSVP_CREATED', {
      userEmail,
      eventTitle,
      rsvpStatus,
      userName
    });
  }

  async notifyRSVPUpdated(userEmail, eventTitle, rsvpStatus, userName) {
    await this.notifyObservers('RSVP_UPDATED', {
      userEmail,
      eventTitle,
      rsvpStatus,
      userName
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;