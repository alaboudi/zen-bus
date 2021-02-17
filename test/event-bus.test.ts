import EventBus from '../src/event-bus';
import {createEventBus} from "../src";

describe('EventBus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should immediately trigger subscribed handlers if event is emitted synchronously', () => {
    const event = { type: 'myEvent' };
    const eventBus = new EventBus();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    eventBus.subscribe('myEvent', fn1);
    eventBus.subscribe('myEvent', fn2);
    eventBus.emitSync(event);
    expect(fn1).toBeCalledWith(event);
    expect(fn1).toBeCalledTimes(1);
    expect(fn2).toBeCalledWith(event);
    expect(fn2).toBeCalledTimes(1);
  });

  it('should asynchronously trigger subscribed handlers if event is emitted asynchronously', async () => {
    const event = { type: 'myEvent' };
    const eventBus = new EventBus();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    eventBus.subscribe('myEvent', fn1);
    eventBus.subscribe('myEvent', fn2);
    eventBus.emit(event);
    expect(fn1).toBeCalledTimes(0);
    expect(fn2).toBeCalledTimes(0);

    jest.runAllTimers();

    expect(fn1).toBeCalledWith(event);
    expect(fn1).toBeCalledTimes(1);
    expect(fn2).toBeCalledWith(event);
    expect(fn2).toBeCalledTimes(1);
  });

  it('should not trigger subscribed handler if non relevant event is emitted', () => {
    const event = { type: 'myEvent' };
    const eventBus = new EventBus();
    const fn1 = jest.fn();
    eventBus.subscribe('notMyEvent', fn1);
    eventBus.emit(event);
    jest.runAllTimers();
    expect(fn1).toBeCalledTimes(0);
  });

  it('should not trigger the handler if it is unsubscribed before event emission', () => {
    const event = { type: 'myEvent' };
    const eventBus = new EventBus();
    const fn1 = jest.fn();
    const unsubscribe = eventBus.subscribe('myEvent', fn1);
    unsubscribe();
    eventBus.emit(event);
    jest.runAllTimers();
    expect(fn1).toBeCalledTimes(0);
  });

  it('should trigger a handler when any event is emitted if it is subscribed to any event', () => {
    const event1 = { type: 'Event 1' };
    const event2 = { type: 'Event 2' };
    const eventBus = new EventBus();
    const fn = jest.fn();

    eventBus.subscribe(EventBus.ANY_EVENT_TYPE, fn);
    eventBus.emit(event1);
    eventBus.emit(event2);

    jest.runAllTimers();

    expect(fn).toBeCalledTimes(2);
    expect(fn).toBeCalledWith(event1);
    expect(fn).toBeCalledWith(event2);
  });

  it('should not call an event type\'s handlers if the subscriptions have been flushed', () => {
    const event = { type: 'My Event'};
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    const eventBus = createEventBus();
    eventBus.subscribe(event.type, fn1);
    eventBus.subscribe(event.type, fn2);
    eventBus.flush(event.type);
    eventBus.emit(event);

    jest.runAllTimers();

    expect(fn1).toBeCalledTimes(0);
    expect(fn2).toBeCalledTimes(0);
  });
});
