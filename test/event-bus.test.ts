import EventBus from '../src/event-bus';

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
});
