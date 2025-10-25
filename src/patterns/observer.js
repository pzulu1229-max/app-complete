// Observer Pattern Implementation
export class EventSubject {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
    console.log(`âœ… Observer added: ${observer.constructor.name}`);
  }

  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      console.log(`âŒ Observer removed: ${observer.constructor.name}`);
    }
  }

  async notifyObservers(eventType, data) {
    console.log(`í´” Notifying ${this.observers.length} observers for event: ${eventType}`);
    
    const notifications = this.observers.map(async (observer) => {
      try {
        if (observer.update && typeof observer.update === 'function') {
          await observer.update(eventType, data);
        }
      } catch (error) {
        console.error(`âŒ Error notifying observer ${observer.constructor.name}:`, error);
      }
    });

    await Promise.allSettled(notifications);
  }

  getObservers() {
    return this.observers.map(observer => observer.constructor.name);
  }
}

export class Observer {
  constructor(name) {
    this.name = name;
  }

  async update(eventType, data) {
    throw new Error('update method must be implemented by subclass');
  }
}
