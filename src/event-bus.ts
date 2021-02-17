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

  private getEventTypeTokens<T extends Event>(
    eventType: EventType<T>
  ): Token[] {
    return this.eventTypeToTokensMap.get(eventType) || [];
  }

  private getAnyEventTypeTokens(): Token[] {
    return this.eventTypeToTokensMap.get(EventBus.ANY_EVENT_TYPE) || [];
  }

  private getHandlersForTokens(tokens: Token[]): EventHandler<any>[] {
    return tokens.map(token => this.tokenToHandlerMap.get(token)!);
  }

  private getTokensForEventTypeEmission<T extends Event>(
    eventType: EventType<T>
  ): Token[] {
    const eventTypeSpecificTokens = this.getEventTypeTokens(eventType);
    const anyEventTypeTokens = this.getAnyEventTypeTokens();
    return [...eventTypeSpecificTokens, ...anyEventTypeTokens];
  }

  private cleanupEventTypeMap<T extends Event>(eventType: EventType<T>): void {
    const tokens = this.getEventTypeTokens(eventType);
    if (tokens.length === 0) {
      this.eventTypeToTokensMap.delete(eventType);
    }
  }

  private addTokenToEventTypeMap(eventType: EventType<any>, token: Token) {
    const tokens = this.getEventTypeTokens(eventType);
    this.eventTypeToTokensMap.set(eventType, [...tokens, token]);
  }

  private removeTokenFromEventTypeMap(eventType: EventType<any>, token: Token) {
    const tokens = this.getEventTypeTokens(eventType);
    const tokenIndex = tokens.indexOf(token);
    tokens.splice(tokenIndex, 1);
    this.cleanupEventTypeMap(eventType);
  }

  private unsubscribeHandler(eventType: EventType<any>, token: Symbol) {
    this.tokenToHandlerMap.delete(token);
    this.removeTokenFromEventTypeMap(eventType, token);
  }

  private getHandlersForEventType<T extends Event>(
    eventType: EventType<T>
  ): EventHandler<T>[] {
    const tokens = this.getTokensForEventTypeEmission(eventType);
    return this.getHandlersForTokens(tokens);
  }

  private executeHandlers<T extends Event>(event: T) {
    const handlers = this.getHandlersForEventType(event.type);
    handlers.forEach(handler => handler(event));
  }

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

  flush<T extends Event>(eventType: EventType<T>) {
    const tokens = this.getEventTypeTokens(eventType);
    this.eventTypeToTokensMap.delete(eventType);
    tokens.forEach(token => this.tokenToHandlerMap.delete(token))
  }
}

export default EventBus;
