import { Question } from '../types';

export const reactCoreQuestions: Question[] = [
  {
    id: 'react_01',
    category: 'reactcore',
    topic: 'React Mental Model vs Angular',
    difficulty: 'Senior',
    question: 'Contrast the React core execution model with Angular. How does component re-rendering in React differ from Angular Change Detection?',
    shortAnswer: 'In React, a component is a pure JavaScript function that re-executes entirely from top to bottom whenever its state (`useState`) or props change, generating a new Virtual DOM tree for Reconciliation (Diffing). In Angular, the component class instance is instantiated once and persists; change detection (or modern fine-grained Signals) inspects and updates dirty template bindings without re-executing the component constructor or class body.',
    seniorPoint: 'In React, every re-render re-creates all inline functions, closures, and local objects unless memoized with `useCallback` or `useMemo`. In Angular, class methods and properties are stable on the instance, but template expressions run on CD cycles unless `OnPush` / Signals are used.',
    spokenTip: 'React re-runs the entire component function on state changes; Angular keeps a persistent class instance and updates dirty template bindings.',
    interviewAnswer: 'Fundamental differences between React and Angular:\n1. **Component Lifecycle & Execution**:\n   - **React**: Functional components re-execute top-to-bottom on every state or prop update. All local variables and unmemoized callbacks are re-instantiated. The resulting JSX produces a new Virtual DOM (Fiber tree) diffed against the previous tree to commit minimal real DOM patches.\n   - **Angular**: Component is an instantiated class instance that remains alive. In Zone.js mode, it runs change detection down the component tree checking dirty bindings. With modern Angular Signals, updates are localized to exact Signal consumers without re-executing the component class.\n2. **State & Reactivity**:\n   - **React**: Uses immutable state setters (`setState(prev => ...)`). Triggers a scheduled re-render.\n   - **Angular**: Uses class properties, RxJS observables with `async` pipe, or Writable Signals (`signal.set()`).\n3. **Dependency Injection vs Context**:\n   - **React**: Uses `React.createContext()` / `useContext()` to pass dependencies down the component tree.\n   - **Angular**: Full-featured hierarchical Dependency Injection (DI) system with constructor / `inject()` injection.',
    keyPointsToMention: [
      'React: Component function re-executes entirely on each render -> Virtual DOM Fiber diffing',
      'Angular: Persistent class instance; template binding dirty checking / Signal fine-grained notifications',
      'React closures: re-created on every render (necessitating useCallback/useMemo)',
      'State: React setState immutability vs Angular Signals / Class properties'
    ],
    whatInterviewersLookFor: [
      'Deep ability to articulate the contrast between full function re-execution vs persistent class instance models',
      'Understanding of Virtual DOM reconciliation (Fiber architecture)'
    ],
    codeExample: `// React Functional Component: Re-executes on EVERY state change!
import React, { useState, useCallback, useMemo } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  // Re-created on every single render unless wrapped in useCallback!
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  // Re-computed on every render unless memoized
  const doubleCount = useMemo(() => count * 2, [count]);

  return (
    <div>
      <p>Count: {count} | Double: {doubleCount}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}

// Angular Contrast: Persistent Class Instance
// @Component({ template: '<button (click)="increment()">{{ count() }}</button>' })
// export class CounterComponent {
//   count = signal(0); // Instance persists, method reference is stable
//   increment() { this.count.update(c => c + 1); }
// }`,
    tags: ['reactcore', 'react', 'angular-vs-react', 'virtual-dom', 'reconciliation', 're-renders']
  },
  {
    id: 'react_02',
    category: 'reactcore',
    topic: 'Hooks Deep Dive: useEffect vs useLayoutEffect vs useRef',
    difficulty: 'Senior',
    question: 'Explain the internal lifecycle of `useEffect`, `useLayoutEffect`, and `useRef`. How do dependency arrays work, and what are "Stale Closures"?',
    shortAnswer: '`useEffect` runs asynchronously after the browser paints (non-blocking). `useLayoutEffect` runs synchronously after DOM mutations but before the browser paints (blocking, for synchronous DOM measurements/flicker prevention). `useRef` holds a persistent mutable object (`{ current: val }`) that survives re-renders without triggering re-renders when mutated. A "Stale Closure" happens when a hook or callback captures an outdated state variable from a previous render cycle due to a missing dependency.',
    seniorPoint: 'Never omit variables referenced inside `useEffect` from the dependency array to silence linters. Either include them, wrap callbacks in `useCallback`, use functional state updates (`setVal(prev => ...)`), or use `useEffectEvent` / refs.',
    spokenTip: 'useEffect runs after paint; useLayoutEffect runs before paint; useRef stores mutable state without triggering renders.',
    interviewAnswer: '1. **useEffect**: Schedules an effect callback to run after the browser has completed layout and paint. Ideal for data fetching, event subscriptions, and logging without delaying visual updates.\n2. **useLayoutEffect**: Executes synchronously immediately after React commits DOM mutations, before the browser paints to the screen. Use only when measuring layout (e.g. tooltip position, scroll offsets) to prevent visual UI flicker.\n3. **useRef**: Returns a persistent reference object `{ current: initialValue }` that persists across all renders. Mutating `.current` is synchronous and never triggers a re-render. Used for DOM element references or tracking timer IDs.\n4. **Stale Closures**: Because functions in React capture variables at the time the render was executed, an un-updated effect dependency array means the callback forever references the old variable value trapped in that old closure.',
    keyPointsToMention: [
      'Timing difference: useEffect (after paint) vs useLayoutEffect (before paint)',
      'useRef does NOT trigger re-renders when mutated',
      'Stale closures: caused by missing dependencies in array capturing outdated render snapshots',
      'Functional setState pattern (setCount(c => c + 1)) to avoid stale closure dependencies'
    ],
    whatInterviewersLookFor: [
      'Ability to debug stale closure bugs in intervals or event listeners',
      'Knowledge of when useLayoutEffect is necessary vs useEffect'
    ],
    codeExample: `import React, { useState, useEffect, useRef } from 'react';

export function TimerComponent() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // ❌ BAD (Stale Closure): setInterval(() => setSeconds(seconds + 1), 1000);
    // Because seconds is trapped at 0!

    // ✅ GOOD (Functional Update):
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1); // Always accesses latest state!
    }, 1000);

    // Teardown cleanup function
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // Empty deps is safe because functional updater doesn't capture state

  return <div>Timer: {seconds}s</div>;
}`,
    tags: ['reactcore', 'react-hooks', 'useeffect', 'uselayouteffect', 'useref', 'stale-closures']
  },
  {
    id: 'react_03',
    category: 'reactcore',
    topic: 'Keys in Lists & Reconciliation Rules',
    difficulty: 'Senior',
    question: 'How does React Reconciliation use the `key` prop when diffing lists? Why is using `index` as a key an anti-pattern for dynamic lists?',
    shortAnswer: 'React uses `key` to identify which items in a list have changed, been added, or been removed between renders. If you use array `index` as a key and items are reordered, inserted at the top, or deleted, React reuses existing DOM nodes and component internal state based on their index, causing input focus bugs, stale state mutations, and inefficient DOM thrashing.',
    seniorPoint: 'A `key` tells React the identity of a component. Changing the key of a component (`<Form key={userId} />`) completely unmounts and remounts the component with fresh state, which is a powerful pattern to reset forms cleanly.',
    spokenTip: 'Keys must be stable, unique, and predictable IDs tied to the data entity, never the transient array index.',
    interviewAnswer: 'During Reconciliation (Fiber diffing), React matches child elements between renders using `type` and `key`:\n1. If `key` and `type` match, React keeps the DOM node and component instance, updating only the changed props.\n2. **Why Index is Dangerous**: If you have 3 items `[A, B, C]` with keys `0, 1, 2`, and you delete item `A`, item `B` becomes index `0` and item `C` becomes index `1`. React thinks item `0` (formerly A) changed into B, keeping any local uncontrolled DOM state (like input text, checkboxes, or focus) attached to the wrong data!\n3. Always use unique, stable business IDs (`item.id`) generated by the database or UUID.',
    keyPointsToMention: [
      'Reconciliation algorithm matches elements by (type, key)',
      'Index as key causes state corruption on insert/delete/sort operations',
      'Keys must be unique among siblings, not globally',
      'Using keys to force full component reset'
    ],
    whatInterviewersLookFor: [
      'Demonstration of the exact bug when an uncontrolled input is deleted from an index-keyed list',
      'Using key changes to reset component internal state'
    ],
    codeExample: `// ❌ BAD: Using index as key in a dynamic list
{todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} onDelete={() => removeTodo(index)} />
))}

// ✅ GOOD: Using stable unique entity ID
{todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} onDelete={() => removeTodo(todo.id)} />
))}

// ✅ ADVANCED: Using key to reset component state on user change
<UserProfileForm key={selectedUserId} userId={selectedUserId} />`,
    tags: ['reactcore', 'reconciliation', 'keys', 'virtual-dom', 'diffing', 'lists']
  }
];
