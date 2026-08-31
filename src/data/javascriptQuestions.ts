import { Question } from '../types';

export const javascriptQuestions: Question[] = [
  {
    id: 'js_01',
    category: 'javascript',
    topic: 'Scope & Variables',
    difficulty: 'Senior',
    question: 'How do var, let, and const differ under the hood regarding scope, hoisting, and the Temporal Dead Zone (TDZ)?',
    shortAnswer: '`var` is function-scoped and hoisted with `undefined` initialization, attaching to `window`/global. `let` and `const` are block-scoped, hoisted into the TDZ uninitialized (access throws ReferenceError), and `const` requires immediate immutable binding assignment.',
    seniorPoint: 'In modern V8 engines, `let` and `const` variables are allocated at the start of their lexical block environment record. TDZ is an intentional engine check before lexical declaration execution to prevent silent undefined-state bugs.',
    spokenTip: 'I break this down across three axes: scoping, lifecycle hoisting, and mutability.',
    interviewAnswer: '`var` is function-scoped (or globally scoped). When the execution context is created, `var` declarations are hoisted and initialized to `undefined`. In contrast, `let` and `const` are block-scoped ({ ... }). They are also hoisted during compilation, but remain in the Temporal Dead Zone (TDZ) where accessing them prior to their lexical line of evaluation throws a `ReferenceError`. Lastly, `const` enforces a constant binding—reassigning the identifier throws a `TypeError`, though nested object properties remain mutable unless frozen.',
    keyPointsToMention: [
      'var is function-scoped and creates global object properties; let/const are block-scoped',
      'Hoisting exists for all three, but let/const exist in the TDZ until initialized',
      'const prevents reassignment of the variable binding, not internal object mutation'
    ],
    whatInterviewersLookFor: [
      'Clear explanation of the Temporal Dead Zone (TDZ)',
      'Understanding of Lexical Environment Records vs Global Object pollution',
      'Awareness that const creates immutable references, not deep immutability'
    ],
    followUpQuestions: [
      'How would you enforce deep immutability on a const object in JavaScript?',
      'What happens if you declare `let x = x;` inside a block?'
    ],
    codeExample: `// TDZ Demonstration
function testTDZ() {
  // console.log(a); // ReferenceError: Cannot access 'a' before initialization
  console.log(b);    // undefined (var hoisted & initialized)
  
  let a = 10;
  var b = 20;
}

// const reference immutability vs mutation
const user = { name: 'Alice' };
user.name = 'Bob'; // Allowed (mutating property)
// user = { name: 'Charlie' }; // TypeError: Assignment to constant variable
Object.freeze(user); // Shallow freeze prevents property mutation`,
    tags: ['javascript', 'scope', 'hoisting', 'tdz', 'variables']
  },
  {
    id: 'js_02',
    category: 'javascript',
    topic: 'Closures & Memory',
    difficulty: 'Senior',
    question: 'What is a Closure in JavaScript, how does the engine retain references, and how can closures cause memory leaks?',
    shortAnswer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. Even after the outer function finishes executing, inner functions retain access to outer variables. Leaks occur if retained closures keep large unneeded objects in scope indefinitely.',
    seniorPoint: 'V8 optimizes closure scopes by creating shared Lexical Contexts. If multiple closures in the same scope retain different variables, they may share a single context holding all captured variables, inadvertently preventing Garbage Collection.',
    spokenTip: 'A closure is simply a function retaining lexical memory of the variables in its parent scope even after the parent has returned.',
    interviewAnswer: 'In JavaScript, functions form closures over their lexical environment. When an outer function executes, it creates a variable environment record. If an inner function references variables from that outer record and survives (e.g., as a callback, event handler, or returned function), the outer record cannot be garbage collected. Memory leaks frequently happen when event listeners, intervals, or long-lived caches capture references to large DOM trees or data payloads inside their closures without teardown.',
    keyPointsToMention: [
      'Lexical scope retention even after the outer call stack frame is popped',
      'Common use cases: data privacy, factory functions, currying, memoization',
      'Memory risks: uncleaned listeners, interval timers, and circular object-DOM references'
    ],
    whatInterviewersLookFor: [
      'Ability to explain how the Garbage Collector determines reachability from the root',
      'Practical examples of leak prevention: clearing timers, removing event listeners, setting captured refs to null'
    ],
    codeExample: `function createCounter() {
  let count = 0; // Private state retained via closure
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.getCount());  // 1

// Potential Memory Leak Pattern
function attachListener() {
  const hugeData = new Array(1000000).fill('leak');
  const button = document.getElementById('my-btn');
  
  // button retains closure over hugeData unless removed or nulled
  button?.addEventListener('click', () => {
    console.log(button.id); // If hugeData is in the same lexical scope, it might be retained
  });
}`,
    tags: ['javascript', 'closures', 'memory-leaks', 'garbage-collection']
  },
  {
    id: 'js_03',
    category: 'javascript',
    topic: 'Execution Context & this',
    difficulty: 'Senior',
    question: 'How is the `this` keyword determined in JavaScript? Contrast standard functions, arrow functions, call/apply/bind, and strict mode.',
    shortAnswer: 'For standard functions, `this` is dynamically bound at call-time based on the invocation site (method call, bare function call, constructor `new`, or explicit `call`/`apply`/`bind`). Arrow functions lack their own `this` binding and lexically inherit `this` from their enclosing scope.',
    seniorPoint: 'In ES modules and strict mode (`"use strict"`), a bare invocation `fn()` sets `this` to `undefined` instead of the global `window`/`globalThis`. Arrow functions cannot be used as constructors and ignore `call`/`apply`/`bind` `thisArg`.',
    spokenTip: '`this` is all about how a function is called, unless it is an arrow function, where it is where it was written.',
    interviewAnswer: 'The `this` keyword represents the execution context of a function call. The 4 binding rules in order of precedence are:\n1. `new` binding (creates a new instance and binds `this` to it)\n2. Explicit binding (`call`, `apply`, `bind`)\n3. Implicit method binding (`obj.method()` sets `this` to `obj`)\n4. Default binding (global object in non-strict mode, `undefined` in strict mode)\n\nArrow functions bypass these rules completely: they do not have a `[[ThisMode]]` or their own `this` binding; they capture the lexical `this` of the surrounding execution context at definition time.',
    keyPointsToMention: [
      'Precedence hierarchy: new > bind/call/apply > implicit object method > default undefined/window',
      'Arrow functions have lexical this and cannot be bound dynamically or used with new',
      'Difference between call (comma args), apply (array of args), and bind (returns bound function)'
    ],
    whatInterviewersLookFor: [
      'Clear recall of the 4 binding rules',
      'Understanding of loss of `this` context when passing object methods as uncurried callbacks',
      'Strict mode vs non-strict mode differences'
    ],
    codeExample: `const service = {
  name: 'AuthService',
  logStandard() {
    console.log(this?.name);
  },
  logArrow: () => {
    console.log(this); // Lexical enclosing scope (e.g. window/module)
  }
};

const bare = service.logStandard;
bare(); // undefined in strict mode (TypeError if accessing this.name)

// Explicit binding
bare.call({ name: 'MockService' }); // 'MockService'
const bound = bare.bind({ name: 'BoundService' });
bound(); // 'BoundService'

// Arrow function in class
class Component {
  name = 'Dashboard';
  handleClick = () => {
    // Guaranteed to retain Component instance even when passed to DOM listener
    console.log(this.name);
  };
}`,
    tags: ['javascript', 'this', 'arrow-functions', 'execution-context', 'bind']
  },
  {
    id: 'js_04',
    category: 'javascript',
    topic: 'Prototypes & Inheritance',
    difficulty: 'Senior',
    question: 'How does the Prototype Chain work in JavaScript, and how do ES6 Classes map to prototype-based inheritance?',
    shortAnswer: 'Every JavaScript object has an internal `[[Prototype]]` link (accessible via `Object.getPrototypeOf(obj)` or `__proto__`). When a property is queried, the engine traverses this chain up to `Object.prototype` (and finally `null`). ES6 `class` is syntactic sugar over constructor functions and prototype inheritance.',
    seniorPoint: 'Methods defined inside an ES6 `class` body are assigned to `Constructor.prototype` and are non-enumerable, whereas class fields (e.g. `handleClick = () => {}`) are instantiated on the instance itself for every object created.',
    spokenTip: 'JavaScript uses prototypal delegation rather than classical class blueprints.',
    interviewAnswer: 'Objects in JS delegate property lookups up a chain of prototype objects. When you access `obj.prop`, if the property does not exist on the own object (`hasOwnProperty`), the engine inspects `Object.getPrototypeOf(obj)`, then that object\'s prototype, continuing until it either finds the property or hits `null`. ES6 `class Person` simply creates a constructor function and attaches methods to `Person.prototype`. The `extends` keyword links the child prototype to the parent prototype via `Object.setPrototypeOf(Child.prototype, Parent.prototype)`.',
    keyPointsToMention: [
      'Prototype lookup delegation vs copying',
      'Difference between prototype (property on constructor functions) and [[Prototype]] / __proto__ (internal link on instances)',
      'Class methods exist on Class.prototype (shared across instances), whereas arrow fields exist on each instance'
    ],
    whatInterviewersLookFor: [
      'Understanding of memory efficiency of prototype methods vs instance-assigned arrow functions',
      'Correct understanding of the terminal prototype (`Object.prototype.__proto__ === null`)'
    ],
    codeExample: `// Prototypal inheritance under the hood
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
// Set prototype chain
Object.setPrototypeOf(Dog.prototype, Animal.prototype);
Dog.prototype.bark = function() { return 'Woof!'; };

const dog = new Dog('Rex', 'German Shepherd');
console.log(dog.speak()); // Delegated to Animal.prototype: "Rex makes a noise."
console.log(dog instanceof Animal); // true

// ES6 Class Equivalent:
class AnimalClass {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a noise.\`; } // On AnimalClass.prototype
}`,
    tags: ['javascript', 'prototypes', 'classes', 'inheritance', 'oop']
  },
  {
    id: 'js_05',
    category: 'javascript',
    topic: 'Event Loop & Concurrency',
    difficulty: 'Senior',
    question: 'Explain the JavaScript Event Loop, Call Stack, Microtask Queue, Macrotask (Task) Queue, and requestAnimationFrame rendering timing.',
    shortAnswer: 'JS is single-threaded with a synchronous Call Stack. When asynchronous operations finish, callbacks go to queues: Microtasks (Promises, `queueMicrotask`, `MutationObserver`) drain completely after every macrotask before rendering. Macrotasks (`setTimeout`, `setInterval`, `I/O`, UI events) execute one per event loop turn. `requestAnimationFrame` runs just before browser style/layout calculations.',
    seniorPoint: 'Starvation: An infinite recursive microtask loop (e.g. `Promise.resolve().then(recurse)`) will starve the macrotask queue, rendering pipeline, and user input, freezing the browser tab completely.',
    spokenTip: 'The key distinction is that the microtask queue is drained completely until empty before the browser can render or execute the next macrotask.',
    interviewAnswer: '1. The synchronous JavaScript call stack executes until empty.\n2. The engine checks the Microtask Queue. It drains ALL available microtasks (including microtasks queued by microtasks) until empty.\n3. The browser checks if a rendering repaint/reflow is due; if so, it executes `requestAnimationFrame` callbacks, computes CSS/layout, and paints.\n4. The engine picks the single oldest Macrotask from the Task Queue (e.g., a `setTimeout` callback or I/O event) and pushes it to the Call Stack.\n5. The cycle repeats.',
    keyPointsToMention: [
      'Microtasks: Promise .then/.catch/.finally, queueMicrotask, MutationObserver',
      'Macrotasks (Tasks): setTimeout, setInterval, setImmediate (Node), I/O, UI event handlers',
      'Render pipeline runs between task completion and the next task if the frame budget permits'
    ],
    whatInterviewersLookFor: [
      'Accurate step-by-step prediction of async execution order in code puzzles',
      'Understanding of UI thread blocking vs responsive async chunking'
    ],
    codeExample: `console.log('1: Sync Stack');

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
    tags: ['javascript', 'event-loop', 'microtasks', 'macrotasks', 'promises', 'concurrency']
  },
  {
    id: 'js_06',
    category: 'javascript',
    topic: 'Promises & Async Combinators',
    difficulty: 'Senior',
    question: 'Compare Promise.all, Promise.allSettled, Promise.race, and Promise.any. How do you implement concurrency limiting?',
    shortAnswer: '`Promise.all` fails fast on the first rejection; `allSettled` waits for all to complete regardless of outcome; `race` settles with the first resolved/rejected promise; `any` resolves with the first successful value and rejects with an `AggregateError` only if all fail.',
    seniorPoint: 'Firing 500 simultaneous promises via `Promise.all` can overwhelm browser HTTP connection limits (6 per domain in HTTP/1.1) or crash backend services. A concurrency pool/p-limit pattern executes batches with an active worker window.',
    spokenTip: 'Pick `all` when you need all-or-nothing data, `allSettled` for bulk independent operations, `any` for fastest successful mirror, and `race` for timeouts.',
    interviewAnswer: '`Promise.all` is all-or-nothing: resolves an array of results if all succeed, but aborts immediately with the first rejection.\n`Promise.allSettled` guarantees every promise settles and returns `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`—ideal when one failure should not kill remaining tasks.\n`Promise.race` settles with whichever finishes first (success or error).\n`Promise.any` ignores rejections until the first success is found.\n\nFor high volumes, running uncontrolled `Promise.all` triggers network waterfalls or socket exhaustion. A concurrency pool maintains an active pool of N executing promises.',
    keyPointsToMention: [
      'Failure behavior: all (first reject), allSettled (never rejects), race (first settle), any (AggregateError if all reject)',
      'Async/await is syntactic sugar over Promises that flattens callback chains',
      'Need for concurrency throttling (e.g. p-limit / semaphore pattern)'
    ],
    whatInterviewersLookFor: [
      'Deep understanding of error handling with async/await and unhandled rejections',
      'Ability to write a simple concurrency pool function or describe the queue mechanism'
    ],
    codeExample: `// Concurrency pool (limit active parallel promises)
async function asyncPool(limit: number, tasks: (() => Promise<any>)[]) {
  const results: any[] = [];
  const executing: Set<Promise<any>> = new Set();

  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);
    
    const clean = () => executing.delete(p);
    p.then(clean, clean);

    if (executing.size >= limit) {
      await Promise.race(executing); // Wait until one slot frees up
    }
  }

  return Promise.all(results);
}`,
    tags: ['javascript', 'promises', 'async-await', 'promise-all', 'concurrency']
  },
  {
    id: 'js_07',
    category: 'javascript',
    topic: 'Performance & Optimization',
    difficulty: 'Senior',
    question: 'How do you implement custom Debounce and Throttle functions from scratch, and when do you choose each?',
    shortAnswer: 'Debounce delays execution until a quiet period (e.g. user stops typing in a search box for 300ms). Throttle guarantees execution at most once per interval (e.g. window resize or scroll handler running at most once every 100ms).',
    seniorPoint: 'Senior developers account for trailing and leading edge execution, cleanup cancellation methods (`cancel()` to avoid memory leaks/stale unmount execution), and passing correct `this` & arguments.',
    spokenTip: 'Debounce waits for silence; throttle paces continuous activity.',
    interviewAnswer: 'Debouncing bunches multiple rapid calls into a single execution after a specified quiet window has elapsed. Common use cases are auto-saving form drafts and search query autocomplete.\nThrottling samples continuous events at a fixed rate, ensuring a function fires at regular intervals regardless of how many times the trigger occurs. Common use cases are scroll tracking, game loops, and drag-and-drop coordinate recalculations.',
    keyPointsToMention: [
      'Debounce: resets timer on every call; executes after timeout',
      'Throttle: enforces a maximum execution frequency over time',
      'Cleanup: always provide a cancel/clear method for SPA unmounting'
    ],
    whatInterviewersLookFor: [
      'Proper closure variable management (`timerId`, `lastRun`)',
      'Correct arguments forwarding (`...args`) and `this` retention',
      'Mention of cancellation support on component teardown'
    ],
    codeExample: `// Debounce implementation
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return debounced;
}

// Throttle implementation
function throttle<T extends (...args: any[]) => void>(fn: T, limit: number) {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}`,
    tags: ['javascript', 'debounce', 'throttle', 'performance', 'utilities']
  },
  {
    id: 'js_08',
    category: 'javascript',
    topic: 'Data Structures & Equality',
    difficulty: 'Senior',
    question: 'Explain Shallow vs Deep Copy, equality checks (`==` vs `===` vs `Object.is`), and structuredClone.',
    shortAnswer: '`==` performs loose type coercion; `===` checks value & type strictly without coercion (except `NaN !== NaN` and `-0 === +0`); `Object.is` handles `NaN` and `+0/-0` correctly. Shallow copy (`...`, `Object.assign`) copies references to nested objects; `structuredClone` performs native deep copying supporting circular references, Maps, Sets, and Dates.',
    seniorPoint: '`JSON.parse(JSON.stringify(obj))` is flawed: it drops functions, `undefined`, `Symbol`, `NaN`/`Infinity` become `null`, `Date` becomes a string, and it crashes on circular structures. `structuredClone()` is the native modern standard.',
    spokenTip: 'Always prefer `===` and `structuredClone()` in modern JavaScript applications.',
    interviewAnswer: 'When cloning objects, a shallow copy copies primitive values and references to nested objects. Mutating a nested property in a shallow clone will mutate the original object. For deep cloning, `structuredClone` is the native Web API standard that supports nested objects, arrays, Dates, RegExps, Maps, Sets, and handles cyclic references correctly. For equality, `==` triggers loose coercion (e.g. `"" == 0` is true), `===` compares identity and primitives without coercion, while `Object.is` fixes edge cases (`Object.is(NaN, NaN)` is true, and `Object.is(+0, -0)` is false).',
    keyPointsToMention: [
      'structuredClone handles circular references, ArrayBuffers, Dates, Maps, Sets',
      'JSON.stringify limitations with functions, undefined, symbols, and dates',
      'Differences between == coercion rules, === strict equality, and Object.is'
    ],
    whatInterviewersLookFor: [
      'Knowledge of structuredClone vs lodash.cloneDeep vs JSON serialization',
      'Understanding of memory immutability patterns'
    ],
    codeExample: `const original = {
  name: 'Anki Pro',
  date: new Date(),
  tags: new Set(['js', 'ts']),
  nested: { score: 100 }
};

// 1. Shallow Copy (nested object still shared)
const shallow = { ...original };
shallow.nested.score = 200; // Mutates original.nested.score!

// 2. Deep Clone via structuredClone
const deep = structuredClone(original);
deep.nested.score = 500; // original.nested.score remains 200
console.log(deep.date instanceof Date); // true
console.log(deep.tags instanceof Set);  // true

// 3. Object.is edge cases
console.log(NaN === NaN);            // false
console.log(Object.is(NaN, NaN));    // true
console.log(+0 === -0);              // true
console.log(Object.is(+0, -0));      // false`,
    tags: ['javascript', 'equality', 'cloning', 'structured-clone', 'immutability']
  }
];
