import createEventBus from '../src/event-bus-factory';
import EventBus from '../src/event-bus';

describe('createEventBus', () => {
  it('should create an instance of an EventBus', () => {
    expect(createEventBus()).toBeInstanceOf(EventBus);
  });
});
