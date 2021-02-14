# Zen Bus ☮️
A simple event bus for your general pub/sub needs.

## installation
```bash
yarn add @zenstack/zen-bus
```
or 
```bash
npm install @zenstack/zen-bus
```

## Usage

### Create An Event Bus
```javascript
import { createEventBus } from "@zenstack/zen-bus";
const eventBus = createEventBus();

//you can also use a class if you are an OO person
import { EventBus } from "@zenstack/zen-bus";
const eventBus = new EventBus();
```

### Subscribe To Particular Event
To subscribe a handler to an event type, you can use the `.subscribe(:eventType, :handler)` method.
```javascript
const myTodoList = ['Clean Toilet'];
const addToList = (event) => myTodoList.push(event.title);
const logEvent = (event) => console.log(event);

eventBus.subscribe('Todo Added', addToList);
eventBus.subscribe('Todo Added', logEvent);
```

### Subscribe To Any Event
If you would like to subscribe a handler to any event type, you can use
the EventBus's `ANY_EVENT_TYPE` static property.
```javascript
import { EventBus } from "@zenstack/zen-bus";

const logEvent = (event) => console.log(event);

// this will trigger `logEvent` when any event is emitted.
eventBus.subscribe(EventBus.ANY_EVENT_TYPE, addToList);
```

### Emit An Event
An event is an object that contains a string `type` attribute. You can asynchronously emit an event
by using the event bus's `.emit(:event)` method.
```javascript
const todoAddedEvent = {
    type: 'Todo Added',
    title: 'Clean the kitchen'
};

eventBus.emit(todoAddedEvent);
```

### Emit An Event Synchronously
By default, events are emitted asynchronously. You can also force the emission
to be synchronous if you'd like.
```javascript
const todoAddedEvent = {
    type: 'Todo Added',
    title: 'Clean the kitchen'
};

eventBus.emitSync(todoAddedEvent);
```

**Note:** Be careful of emitting events synchronously. It has a few disadvantages:

- It locks up the thread up until all handlers have been executed
- Strange sequences may occur if you decide to emit another event as part of
another event's handler. Just don't do this synchronously... you have been warned.
