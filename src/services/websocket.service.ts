// Observer Pattern Implementation for WebSocket Management
interface WebSocketObserver {
  id: string;
  send: (data: any) => void;
}

export class WebSocketService {
  private observers: Map<string, WebSocketObserver> = new Map();
  private eventSubscriptions: Map<string, Set<string>> = new Map();

  // Subject methods from Observer Pattern
  subscribe(observer: WebSocketObserver): void {
    this.observers.set(observer.id, observer);
    console.log(`WebSocket client connected: ${observer.id}`);
  }

  unsubscribe(observerId: string): void {
    this.observers.delete(observerId);
    // Remove from all event subscriptions
    this.eventSubscriptions.forEach((subscribers, eventId) => {
      subscribers.delete(observerId);
    });
    console.log(`WebSocket client disconnected: ${observerId}`);
  }

  // Notify all observers
  broadcast(message: { type: string; data: any }): void {
    this.observers.forEach(observer => {
      try {
        observer.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending to observer ${observer.id}:`, error);
        this.unsubscribe(observer.id);
      }
    });
  }

  // Notify specific event subscribers
  notifyEventSubscribers(eventId: string, message: { type: string; data: any }): void {
    const subscribers = this.eventSubscriptions.get(eventId);
    if (subscribers) {
      subscribers.forEach(observerId => {
        const observer = this.observers.get(observerId);
        if (observer) {
          try {
            observer.send(JSON.stringify(message));
          } catch (error) {
            console.error(`Error sending to observer ${observerId}:`, error);
            this.unsubscribe(observerId);
          }
        }
      });
    }
  }

  // Subscribe to specific event updates
  subscribeToEvent(observerId: string, eventId: string): void {
    if (!this.eventSubscriptions.has(eventId)) {
      this.eventSubscriptions.set(eventId, new Set());
    }
    this.eventSubscriptions.get(eventId)!.add(observerId);
  }

  // Unsubscribe from specific event
  unsubscribeFromEvent(observerId: string, eventId: string): void {
    const subscribers = this.eventSubscriptions.get(eventId);
    if (subscribers) {
      subscribers.delete(observerId);
      if (subscribers.size === 0) {
        this.eventSubscriptions.delete(eventId);
      }
    }
  }

  getConnectedClients(): number {
    return this.observers.size;
  }
}

export const webSocketService = new WebSocketService();
