import { Question } from '../types';

export const javascriptQuestions: Question[] = [
  {
    id: 'js_01',
    category: 'javascript',
    topic: 'Scope & Variables',
    difficulty: 'Senior',
    question: 'How do var, let, and const differ under the hood regarding scope, hoisting, and the Temporal Dead Zone (TDZ)?',
    shortAnswer: '`var` is function-scoped and hoisted with `undefined` initialization, attaching to the global object. `let` and `const` are block-scoped, hoisted into the Temporal Dead Zone (TDZ) uninitialized (accessing them throws a `ReferenceError`), and `const` enforces an immutable variable binding.',
    interviewAnswer: 'I compare `var`, `let`, and `const` across three axes:\n1. **Scoping**: `var` is function-scoped (or globally scoped). `let` and `const` are block-scoped to the nearest `{}` enclosing block.\n2. **Hoisting & TDZ**: All three declarations are hoisted during the compilation phase. However, `var` is initialized to `undefined` immediately, allowing you to read it before its line of declaration. `let` and `const` enter the Temporal Dead Zone—they exist in lexical memory, but accessing them before the actual declaration line throws a `ReferenceError`.\n3. **Binding Immutability**: `const` creates an immutable identifier binding—you cannot reassign the variable. However, object properties inside a `const` variable remain mutable unless frozen via `Object.freeze()`.',
    spokenTip: 'I break this down across three axes: scoping rules, hoisting lifecycle with TDZ, and reassignment constraints.',
    example: {
      language: 'javascript',
      code: `function testScopeAndTDZ() {
  // console.log(a); // ReferenceError: Cannot access 'a' before initialization (TDZ)
  console.log(b);    // undefined (var is hoisted and initialized)

  let a = 10;
  var b = 20;

  // Block Scoping
  if (true) {
    let blockVar = 'inside';
    var funcVar = 'leaked outside block';
  }
  // console.log(blockVar); // ReferenceError
  console.log(funcVar);    // 'leaked outside block'
}

// const reference binding vs property mutation
const user = { name: 'Alice' };
user.name = 'Bob'; // Allowed: property mutation
// user = { name: 'Charlie' }; // TypeError: Assignment to constant variable
Object.freeze(user); // Shallow freeze prevents property mutation`,
      explanation: 'Shows TDZ ReferenceError vs var undefined hoisting, and const reference immutability.'
    },
    seniorPoint: 'In modern V8 engines, `let` and `const` variables are allocated at the start of their lexical block environment record. TDZ is an intentional engine check before lexical declaration execution to prevent silent undefined-state bugs.',
    followUps: [
      {
        question: 'What happens if you run `let x = x;` inside a block?',
        answer: 'It throws a `ReferenceError` because the right-hand side `x` is evaluated while `x` is still inside the TDZ before initialization completes.'
      },
      {
        question: 'How do you enforce deep immutability on a JavaScript object?',
        answer: '`Object.freeze()` is only shallow. For deep immutability, write a recursive freeze function or use libraries like Immer or Immutable.js.'
      }
    ],
    keyPointsToMention: [
      'var is function-scoped and creates global object properties; let/const are block-scoped',
      'Hoisting exists for all three, but let/const exist in the TDZ until initialized',
      'const prevents reassignment of the variable binding, not internal object mutation'
    ],
    tags: ['javascript', 'scope', 'hoisting', 'tdz', 'variables']
  },
  {
    id: 'js_02',
    category: 'javascript',
    topic: 'Closures & Memory',
    difficulty: 'Senior',
    question: 'What is a Closure in JavaScript, how does the engine retain references, and how can closures cause memory leaks?',
    shortAnswer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. Even after the outer function finishes executing, inner functions retain access to outer variables. Leaks occur if retained closures keep large unneeded objects in scope indefinitely.',
    interviewAnswer: 'In JavaScript, functions form closures over their lexical environment. When an outer function executes, it creates a variable environment record on the heap. If an inner function references variables from that outer scope and survives (as a callback, event handler, or returned function), the outer variables cannot be garbage collected.\n\nClosures are fundamental for data privacy, factory functions, and memoization. However, memory leaks happen when long-lived callbacks (like global event listeners, intervals, or caching maps) hold references to large DOM trees or datasets inside their closure scope without being cleaned up when views unmount.',
    spokenTip: 'A closure is simply a function retaining lexical access to variables in its parent scope even after the parent function has finished executing.',
    example: {
      language: 'javascript',
      code: `function createCounter() {
  let count = 0; // Private state retained via closure
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.getCount());  // 1

// Potential Memory Leak Pattern:
function attachLeakyListener() {
  const hugeDataPayload = new Array(1000000).fill('data');
  const button = document.getElementById('submit-btn');

  // If button lives forever, hugeDataPayload is retained in memory!
  button?.addEventListener('click', () => {
    console.log(button.id); // Captures lexical scope containing hugeDataPayload
  });
}`,
      explanation: 'Shows private state retention with closures and a common memory leak in long-lived event listeners.'
    },
    seniorPoint: 'V8 optimizes closure scopes by creating shared Lexical Contexts. If multiple closures in the same scope retain different variables, they may share a single context holding all captured variables, inadvertently preventing Garbage Collection.',
    followUps: [
      {
        question: 'How does the JavaScript Garbage Collector determine what memory to free?',
        answer: 'Modern engines use Mark-and-Sweep. The GC starts from GC Roots (global window, call stack variables) and traces reachability. If an object is unreachable from any root, its memory is reclaimed.'
      },
      {
        question: 'How do you prevent closure memory leaks in Single Page Applications?',
        answer: 'Always remove event listeners in teardown lifecycle hooks, cancel setInterval/setTimeout timers, and unsubscribe from RxJS observables.'
      }
    ],
    keyPointsToMention: [
      'Lexical scope retention even after the outer call stack frame is popped',
      'Common use cases: data privacy, factory functions, currying, memoization',
      'Memory risks: uncleaned listeners, interval timers, and circular object-DOM references'
    ],
    tags: ['javascript', 'closures', 'memory-leaks', 'garbage-collection']
  },
  {
    id: 'js_03',
    category: 'javascript',
    topic: 'Execution Context & this',
    difficulty: 'Senior',
    question: 'How is the this keyword determined in JavaScript? Contrast standard functions, arrow functions, call/apply/bind, and strict mode.',
    shortAnswer: 'For standard functions, `this` is dynamically bound at invocation time based on how the function is called (`new`, explicit `call`/`apply`/`bind`, implicit method call, or default global/undefined). Arrow functions do not have their own `this`; they capture the lexical `this` from where they were defined.',
    interviewAnswer: 'The `this` keyword represents the execution context of a function call. For standard functions, `this` is evaluated at call time using 4 rules in order of precedence:\n1. **`new` Binding**: When invoked with `new`, `this` is the newly created object instance.\n2. **Explicit Binding**: Using `fn.call()`, `fn.apply()`, or `fn.bind()` explicitly sets `this`.\n3. **Implicit Method Binding**: In `user.getName()`, `this` refers to `user`.\n4. **Default Binding**: A bare function call `fn()` sets `this` to the global object (`window`) in non-strict mode, and `undefined` in strict mode (`"use strict"`).\n\nArrow functions ignore these rules completely. They do not have their own `this` binding; they capture the lexical `this` of the enclosing scope at definition time and cannot be used with `new` or rebound with `bind()`.',
    spokenTip: '`this` depends on HOW a function is called, unless it is an arrow function, where it depends on WHERE it was written.',
    example: {
      language: 'javascript',
      code: `const service = {
  name: 'AuthService',
  logStandard() {
    console.log(this?.name);
  },
  logArrow: () => {
    console.log(this); // Lexical enclosing scope (e.g. window/module)
  }
};

const bare = service.logStandard;
// bare(); // TypeError in strict mode (this is undefined)

// Explicit binding
bare.call({ name: 'MockService' }); // Logs: 'MockService'
const bound = bare.bind({ name: 'BoundService' });
bound(); // Logs: 'BoundService'

// Arrow functions in classes guarantee stable 'this'
class Component {
  name = 'Dashboard';
  handleClick = () => {
    // Retains Component instance even when passed as a DOM callback!
    console.log(this.name);
  };
}`,
      explanation: 'Shows method vs bare invocation, explicit binding with call/bind, and arrow function lexical this.'
    },
    seniorPoint: 'In ES modules and strict mode, bare function calls default `this` to `undefined` instead of `window`. Class bodies are always executed in strict mode by default.',
    followUps: [
      {
        question: 'What is the difference between call, apply, and bind?',
        answer: '`call` invokes the function immediately with comma-separated arguments. `apply` invokes immediately with an array of arguments. `bind` returns a new function with `this` permanently bound without invoking it immediately.'
      },
      {
        question: 'Can you re-bind an arrow function using .bind()?',
        answer: 'No. Arrow functions have no `this` binding of their own; calling `.bind()` on an arrow function has no effect on its `this` value.'
      }
    ],
    keyPointsToMention: [
      'Precedence hierarchy: new > bind/call/apply > implicit object method > default undefined/window',
      'Arrow functions have lexical this and cannot be bound dynamically or used with new',
      'Difference between call (comma args), apply (array of args), and bind (returns bound function)'
    ],
    tags: ['javascript', 'this', 'arrow-functions', 'execution-context', 'bind']
  },
  {
    id: 'js_04',
    category: 'javascript',
    topic: 'Prototypes & Inheritance',
    difficulty: 'Senior',
    question: 'How does the Prototype Chain work in JavaScript, and how do ES6 Classes map to prototype-based inheritance?',
    shortAnswer: 'Every JavaScript object has an internal `[[Prototype]]` link (accessible via `Object.getPrototypeOf(obj)` or `__proto__`). When querying a property, the engine traverses this chain up to `Object.prototype` (and finally `null`). ES6 `class` syntax is syntactic sugar over constructor functions and prototype inheritance.',
    interviewAnswer: 'JavaScript uses prototypal delegation rather than classical copy-based inheritance. Every object has an internal link `[[Prototype]]` to another object. When you access `obj.method()`, if the property does not exist directly on `obj` (`hasOwnProperty`), the engine inspects `Object.getPrototypeOf(obj)` and continues up the chain until it finds the property or reaches `null`.\n\nES6 `class` syntax is syntactic sugar. When you write `class Animal { speak() {} }`, JavaScript creates a constructor function and attaches `speak` to `Animal.prototype`. The `extends` keyword links the child prototype to the parent prototype via `Object.setPrototypeOf(Dog.prototype, Animal.prototype)`.',
    spokenTip: 'JavaScript uses prototypal delegation where objects inherit directly from other objects through a prototype chain.',
    example: {
      language: 'javascript',
      code: `// Prototypal inheritance under the hood
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return \`\${this.name} makes a noise.\`;
};

function Dog(name, breed) {
  Animal.call(this, name); // Super constructor call
  this.breed = breed;
}
// Set prototype delegation chain
Object.setPrototypeOf(Dog.prototype, Animal.prototype);
Dog.prototype.bark = function() { return 'Woof!'; };

const dog = new Dog('Rex', 'Shepherd');
console.log(dog.speak()); // Delegated to Animal.prototype: "Rex makes a noise."
console.log(dog instanceof Animal); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null (end of chain)

// ES6 Class Equivalent (Syntactic sugar):
class AnimalClass {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a noise.\`; } // Placed on AnimalClass.prototype
}`,
      explanation: 'Demonstrates prototype chain delegation, super calls, and the ES6 class equivalent.'
    },
    seniorPoint: 'Methods declared inside an ES6 `class` body are stored on `Class.prototype` and shared across all instances (memory efficient). Class field arrow functions (`speak = () => {}`) are created as separate function instances on every object instance.',
    followUps: [
      {
        question: 'What is the difference between `prototype` and `__proto__`?',
        answer: '`prototype` is a property on constructor functions used to build `[[Prototype]]` on new instances. `__proto__` (or `Object.getPrototypeOf()`) is the actual prototype reference on an object instance.'
      },
      {
        question: 'What is at the very end of every prototype chain?',
        answer: '`Object.prototype.__proto__`, which is `null`.'
      }
    ],
    keyPointsToMention: [
      'Prototype lookup delegation vs copying',
      'Difference between prototype (property on constructor functions) and [[Prototype]] / __proto__ (internal link on instances)',
      'Class methods exist on Class.prototype (shared across instances), whereas arrow fields exist on each instance'
    ],
    tags: ['javascript', 'prototypes', 'classes', 'inheritance', 'oop']
  },
  {
    id: 'js_05',
    category: 'javascript',
    topic: 'Event Loop & Concurrency',
    difficulty: 'Senior',
    question: 'Explain the JavaScript Event Loop, Call Stack, Microtask Queue, Macrotask Queue, and requestAnimationFrame rendering timing.',
    shortAnswer: 'JavaScript is single-threaded with a synchronous Call Stack. Microtasks (`Promise.then`, `queueMicrotask`, `MutationObserver`) drain completely until empty after every task before rendering. Macrotasks (`setTimeout`, `setInterval`, I/O, UI events) execute one per event loop cycle. `requestAnimationFrame` runs just before browser style/layout calculations and painting.',
    interviewAnswer: 'The Event Loop coordinates JavaScript execution and browser rendering:\n1. **Synchronous Call Stack**: Code executes synchronously until the stack is completely empty.\n2. **Microtask Queue**: The engine checks the Microtask Queue and drains ALL microtasks (including microtasks queued by other microtasks) until the queue is empty.\n3. **Render Pipeline**: If a frame is due (typically every 16.6ms for 60Hz), the browser executes `requestAnimationFrame` callbacks, recalculates CSS/layout (reflow), and paints pixels to the screen.\n4. **Macrotask (Task) Queue**: The engine picks the single oldest task from the Task Queue (e.g. `setTimeout` callback or user DOM event), pushes it to the Call Stack, and runs it.\n5. The cycle repeats continuously.',
    spokenTip: 'The key rule to remember is that the microtask queue is drained completely until empty before the browser can render or execute the next macrotask.',
    example: {
      language: 'javascript',
      code: `console.log('1: Sync Stack');

setTimeout(() => {
  console.log('2: Macrotask (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Microtask 1');
}).then(() => {
  console.log('4: Microtask 2 (chained)');
});

queueMicrotask(() => {
  console.log('5: Microtask 3 (queueMicrotask)');
});

console.log('6: Sync Stack End');

// Execution Output Order:
// 1: Sync Stack
// 6: Sync Stack End
// 3: Microtask 1
// 5: Microtask 3 (queueMicrotask)
// 4: Microtask 2 (chained)
// 2: Macrotask (setTimeout)`,
      explanation: 'Demonstrates synchronous stack execution, complete microtask draining, and subsequent macrotask execution.'
    },
    seniorPoint: 'An infinite recursive microtask loop (`function loop() { Promise.resolve().then(loop); }`) will starve the macrotask queue and render pipeline, completely freezing the browser tab and preventing UI updates or user clicks.',
    followUps: [
      {
        question: 'What is the difference between `setTimeout(fn, 0)` and `queueMicrotask(fn)`?',
        answer: '`queueMicrotask` runs immediately after the current synchronous script finishes and before rendering. `setTimeout(fn, 0)` queues a macrotask that runs in a future event loop turn after rendering.'
      },
      {
        question: 'Why should animation updates be placed inside `requestAnimationFrame` instead of `setInterval`?',
        answer: '`requestAnimationFrame` syncs with the monitor refresh rate (e.g. 60Hz/120Hz) and pauses in background tabs, whereas `setInterval` runs on arbitrary timers, causing frame drops, jank, and battery drain.'
      }
    ],
    keyPointsToMention: [
      'Microtasks: Promise .then/.catch/.finally, queueMicrotask, MutationObserver',
      'Macrotasks: setTimeout, setInterval, I/O, UI event handlers',
      'Microtask queue drains completely before browser rendering',
      'rAF runs before layout and paint'
    ],
    tags: ['javascript', 'event-loop', 'microtasks', 'macrotasks', 'promises', 'concurrency']
  },
  {
    id: 'js_06',
    category: 'javascript',
    topic: 'Promises & Async Combinators',
    difficulty: 'Senior',
    question: 'Compare Promise.all, Promise.allSettled, Promise.race, and Promise.any. How do you implement concurrency limiting?',
    shortAnswer: '`Promise.all` fails fast on the first rejection; `allSettled` waits for all promises to settle regardless of success or error; `race` settles with the first promise that resolves or rejects; `any` resolves with the first successful value and rejects with an `AggregateError` only if all fail.',
    interviewAnswer: 'The 4 Promise combinators serve distinct use cases:\n- **`Promise.all`**: All-or-nothing. Resolves with an array of values if all succeed; aborts immediately on the first rejection. Best for fetching required dependent data on page load.\n- **`Promise.allSettled`**: Always waits for all promises to finish and returns `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`. Best for independent bulk operations where partial failure is acceptable.\n- **`Promise.race`**: Settles with whichever promise finishes first, whether fulfilled or rejected. Great for implementing request timeouts.\n- **`Promise.any`**: Resolves with the fastest successful promise, ignoring rejections until all fail. Great for fetching data from multiple redundant mirror servers.\n\nFor high-volume tasks, firing 500 promises via `Promise.all` can exhaust network sockets or rate limits. We implement a **Concurrency Pool** to run a maximum of N active promises concurrently.',
    spokenTip: 'Pick Promise.all for all-or-nothing, allSettled for independent bulk jobs, any for fastest successful mirror, and race for timeouts.',
    example: {
      language: 'javascript',
      code: `// Concurrency Pool (limits active parallel promises)
async function asyncPool(limit, tasks) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);

    const clean = () => executing.delete(p);
    p.then(clean, clean);

    if (executing.size >= limit) {
      await Promise.race(executing); // Wait until at least one slot frees up
    }
  }

  return Promise.all(results);
}

// Usage: Run 50 tasks with maximum 4 concurrent workers
// const tasks = urls.map(url => () => fetch(url).then(r => r.json()));
// const data = await asyncPool(4, tasks);`,
      explanation: 'Implements a clean concurrency pool using Promise.race and Set tracking.'
    },
    seniorPoint: 'Firing unthrottled `Promise.all` requests against backend microservices or browser connections (which cap at 6 concurrent TCP connections per domain in HTTP/1.1) causes request waterfalls and connection queueing.',
    followUps: [
      {
        question: 'What error is thrown when all promises in `Promise.any` reject?',
        answer: 'An `AggregateError`, which contains an `errors` array holding the rejection reasons from all promises.'
      },
      {
        question: 'How do you cancel a pending fetch Promise in modern JavaScript?',
        answer: 'Use `AbortController`. Pass `controller.signal` to `fetch(url, { signal })` and invoke `controller.abort()` to cancel the request.'
      }
    ],
    keyPointsToMention: [
      'Failure behavior: all (first reject), allSettled (never rejects), race (first settle), any (AggregateError if all reject)',
      'Async/await is syntactic sugar over Promises that flattens callback chains',
      'Need for concurrency throttling (e.g. p-limit / semaphore pattern)'
    ],
    tags: ['javascript', 'promises', 'async-await', 'promise-all', 'concurrency']
  },
  {
    id: 'js_07',
    category: 'javascript',
    topic: 'Performance & Optimization',
    difficulty: 'Senior',
    question: 'How do you implement custom Debounce and Throttle functions from scratch, and when do you choose each?',
    shortAnswer: 'Debounce delays execution until a quiet pause has elapsed (e.g. user stops typing for 300ms in a search box). Throttle guarantees execution at most once per fixed time interval (e.g. scroll or window resize handler firing at most once every 100ms).',
    interviewAnswer: 'Debouncing and throttling are rate-limiting techniques for event listeners:\n- **Debounce**: Groups a burst of rapid events into a single call. Every new trigger resets the countdown timer. Only when the user pauses for the specified delay does the function execute. Best for auto-saving form drafts, window resize recalculations, and search autocomplete inputs.\n- **Throttle**: Enforces a maximum execution rate over time. It guarantees the function executes at regular intervals (e.g. every 100ms) during continuous events. Best for scroll position tracking, drag-and-drop coordinate math, and game loops.\n\nIn senior implementations, always preserve the `this` context, forward arguments, and provide a `.cancel()` method to clear pending timers on component unmount.',
    spokenTip: 'Debounce waits for silence; throttle paces continuous activity.',
    example: {
      language: 'javascript',
      code: `// 1. Debounce implementation with cancellation
function debounce(fn, delay) {
  let timerId = null;

  const debounced = function (...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}

// 2. Throttle implementation
function throttle(fn, limit) {
  let inThrottle = false;

  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}`,
      explanation: 'Custom debounce with timer reset and cancellation, and throttle with flag lock.'
    },
    seniorPoint: 'Failing to cancel pending debounced callbacks when an Angular/React component unmounts causes memory leaks and errors when the callback tries to update state on an unmounted component.',
    followUps: [
      {
        question: 'What is leading-edge (immediate) debounce versus trailing-edge debounce?',
        answer: 'Leading-edge debounce executes immediately on the first call and then suppresses subsequent calls until a quiet pause. Trailing-edge (standard) waits for the quiet pause before executing.'
      },
      {
        question: 'How does RxJS handle debouncing and throttling in Angular?',
        answer: 'RxJS provides `debounceTime(ms)` and `throttleTime(ms)` operators that work seamlessly inside observable pipes with automatic cancellation.'
      }
    ],
    keyPointsToMention: [
      'Debounce: resets timer on every call; executes after timeout',
      'Throttle: enforces a maximum execution frequency over time',
      'Cleanup: always provide a cancel/clear method for SPA unmounting'
    ],
    tags: ['javascript', 'debounce', 'throttle', 'performance', 'utilities']
  },
  {
    id: 'js_08',
    category: 'javascript',
    topic: 'Data Structures & Equality',
    difficulty: 'Senior',
    question: 'Explain Shallow vs Deep Copy, equality checks (== vs === vs Object.is), and structuredClone.',
    shortAnswer: '`==` performs loose type coercion; `===` checks value and type strictly without coercion (except `NaN !== NaN` and `-0 === +0`); `Object.is` handles `NaN` and `+0/-0` accurately. Shallow copy (`...`, `Object.assign`) copies references to nested objects. `structuredClone` performs native deep copying supporting circular references, Maps, Sets, and Dates.',
    interviewAnswer: 'When copying objects:\n- **Shallow Copy** (`{ ...obj }`, `Object.assign()`): Copies primitive properties, but copies memory references for nested objects and arrays. Modifying a nested property in the clone mutates the original object.\n- **Deep Copy**:\n  - Legacy `JSON.parse(JSON.stringify(obj))` has major flaws: it strips functions and `undefined`, converts `Date` to strings, changes `NaN`/`Infinity` to `null`, and throws on circular references.\n  - Native `structuredClone(obj)`: The modern Web standard. It supports circular references, Dates, RegExps, Maps, Sets, and ArrayBuffers.\n\nFor equality:\n- `==` performs loose type coercion (e.g. `"" == 0` is true).\n- `===` checks type and value strictly without coercion, but has two quirks: `NaN === NaN` is `false`, and `+0 === -0` is `true`.\n- `Object.is` fixes these quirks: `Object.is(NaN, NaN)` is `true`, and `Object.is(+0, -0)` is `false`.',
    spokenTip: 'Always use strict equality `===` and native `structuredClone()` for reliable deep copying.',
    example: {
      language: 'javascript',
      code: `const original = {
  name: 'Interview Anki',
  date: new Date(),
  tags: new Set(['js', 'ts']),
  nested: { score: 100 }
};

// 1. Shallow Copy (nested object is shared!)
const shallow = { ...original };
shallow.nested.score = 200; // Mutates original.nested.score!

// 2. Deep Clone via native structuredClone
const deep = structuredClone(original);
deep.nested.score = 500; // original.nested.score remains 200!
console.log(deep.date instanceof Date); // true
console.log(deep.tags instanceof Set);  // true

// 3. Object.is vs === edge cases
console.log(NaN === NaN);            // false
console.log(Object.is(NaN, NaN));    // true
console.log(+0 === -0);              // true
console.log(Object.is(+0, -0));      // false`,
      explanation: 'Demonstrates shallow vs structuredClone deep copy and Object.is edge case comparisons.'
    },
    seniorPoint: '`structuredClone` cannot clone DOM nodes, functions, or prototype chains (it clones plain data objects). If an object contains class methods, `structuredClone` will throw a `DataCloneError`.',
    followUps: [
      {
        question: 'Why does React use `Object.is` for state comparison?',
        answer: 'React uses `Object.is` in `useState` and `useMemo` so that updating state from `NaN` to `NaN` does not trigger an unnecessary re-render.'
      },
      {
        question: 'How do you check if two distinct objects are deeply equal in JavaScript?',
        answer: 'Because `===` checks memory reference, you must write a recursive deep equality comparison or use utilities like `lodash.isEqual`.'
      }
    ],
    keyPointsToMention: [
      'structuredClone handles circular references, ArrayBuffers, Dates, Maps, Sets',
      'JSON.stringify limitations with functions, undefined, symbols, and dates',
      'Differences between == coercion rules, === strict equality, and Object.is'
    ],
    tags: ['javascript', 'equality', 'cloning', 'structured-clone', 'immutability']
  }
];
