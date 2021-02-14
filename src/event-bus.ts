export interface Event {
  type: string;
}
export type EventType<T extends Event> = T['type'];

export interface EventHandler<T extends Event> {
  (event: T): void;
}

export interface Unsubscriber {
  (): void;
}

type Token = Symbol;

class EventBus {
  static ANY_EVENT_TYPE = Symbol('Any Event Type') as EventType<any>;
  private tokenToHandlerMap = new Map<Token, EventHandler<any>>();
  private eventTypeToTokensMap = new Map<EventType<any>, Token[]>();

  private addTokenToEventTypeMap(eventType: EventType<any>, token: Token) {
    const tokens = this.eventTypeToTokensMap.get(eventType) || [];
    tokens.push(token);
    this.eventTypeToTokensMap.set(eventType, tokens);
  }

  private removeTokenFromEventTypeMap(eventType: EventType<any>, token: Token) {
    const tokens = this.eventTypeToTokensMap.get(eventType);
    if (tokens !== undefined) {
      const tokenIndex = tokens.indexOf(token);
      tokens.splice(tokenIndex, 1);

      if (tokens.length === 0) {
        this.eventTypeToTokensMap.delete(eventType);
      }
    }
  }

  private unsubscribeHandler(eventType: EventType<any>, token: Symbol) {
    this.tokenToHandlerMap.delete(token);
    this.removeTokenFromEventTypeMap(eventType, token);
  }

  private getTokensForEventType<T extends Event>(eventType: EventType<T>) {
    return this.eventTypeToTokensMap.get(eventType) || [];
  }

  private getHandlersForEventType<T extends Event>(
    eventType: EventType<T>
  ): EventHandler<T>[] {
    const eventTypeSpecificTokens = this.getTokensForEventType(eventType);
    const anyEventTypeTokens = this.getTokensForEventType(EventBus.ANY_EVENT_TYPE);
    const tokens = [...eventTypeSpecificTokens, ...anyEventTypeTokens];

    return tokens.map(token => this.tokenToHandlerMap.get(token)!);
  }

  private executeHandlers<T extends Event>(event: T) {
    const handlers = this.getHandlersForEventType(event.type);
    handlers.forEach(handler => handler(event));
  }

  constructor() {}

  subscribe<T extends Event>(
    eventType: EventType<T>,
    handler: EventHandler<T>
  ): Unsubscriber {
    const token = Symbol();
    this.tokenToHandlerMap.set(token, handler);
    this.addTokenToEventTypeMap(eventType, token);
    return () => this.unsubscribeHandler(eventType, token);
  }

  emit<T extends Event>(event: T) {
    setTimeout(() => this.executeHandlers(event), 0);
  }

  emitSync<T extends Event>(event: T) {
    this.executeHandlers(event);
  }
}

export default EventBus;
