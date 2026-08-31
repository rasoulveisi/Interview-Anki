import { Question } from '../types';

export const reactCoreQuestions: Question[] = [
  {
    id: 'react_01',
    category: 'reactcore',
    topic: 'Mental Model & Reconciliation',
    difficulty: 'Senior',
    question: 'How does React’s Virtual DOM and Fiber Reconciliation work compared to Angular’s fine-grained Signals and Change Detection?',
    shortAnswer: 'React uses a Virtual DOM with the Fiber architecture, splitting work into a non-blocking Render/Reconciliation phase (diffing VDOM trees) and a synchronous Commit phase (applying DOM updates). Angular historically used top-down Zone.js dirty checking, but modern Angular uses fine-grained reactive Signals to update specific DOM bindings directly without tree-wide diffing.',
    interviewAnswer: 'The core difference is top-down component re-execution versus fine-grained reactive graph propagation:\n- **React (Fiber & VDOM)**: When state updates in React (`setState`), React re-executes the entire component function and produces a new Virtual DOM tree. The **Fiber reconciler** compares the new VDOM with the old one (Render Phase, which can be paused/split in Concurrent Mode), calculates the minimal set of DOM mutations (diff), and synchronously applies them to the real DOM during the **Commit Phase**.\n- **Angular (Signals & Zoneless)**: In modern Angular, a Signal update directly notifies the specific DOM binding or view that read the signal. Angular does not build or diff a Virtual DOM; it updates real DOM nodes directly with surgical precision.',
    spokenTip: 'React re-runs component functions and diffs Virtual DOM trees, whereas modern Angular uses reactive Signals to update exact DOM nodes directly.',
    example: {
      language: 'typescript',
      code: `// React: Component function re-executes on state changes
import React, { useState } from 'react';

export function CounterWidget() {
  const [count, setCount] = useState(0);
  console.log('CounterWidget function body re-executed!');

  return (
    <div>
      <p>Count: {count}</p>
      {/* Creates a new Virtual DOM element tree on every click */}
      <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
    </div>
  );
}

// React Fiber 2-Phase Execution:
// 1. Render Phase (Asynchronous / Interruptible): Compares JSX Fiber nodes
// 2. Commit Phase (Synchronous): Updates real browser DOM and runs useLayoutEffect`,
      explanation: 'Illustrates how React components re-execute entirely on state updates vs Fiber two-phase reconciliation.'
    },
    seniorPoint: 'Because React components re-execute on every render, functions and objects declared inside the component body get brand-new memory references every render unless wrapped in `useCallback` or `useMemo`. In Angular, class component instances persist across change detection cycles.',
    followUps: [
      {
        question: 'What is the purpose of the Fiber data structure in React?',
        answer: 'Fiber is a linked-list representation of the component tree that allows React to pause, prioritize, and resume rendering work across animation frames (Concurrent React).'
      },
      {
        question: 'What is the difference between the Render Phase and Commit Phase in React?',
        answer: 'The Render phase is pure, side-effect free, and calculates differences in memory (can be aborted). The Commit phase is synchronous and applies actual DOM mutations and mutations to the browser screen.'
      }
    ],
    keyPointsToMention: [
      'React: Virtual DOM diffing, Fiber tree, 2-phase execution (Render vs Commit)',
      'Angular: Direct template compilation, Signals reactive graph, zero VDOM overhead',
      'React re-runs the entire function component body on state changes',
      'Impact of object reference recreation on downstream child re-renders'
    ],
    tags: ['react', 'virtual-dom', 'fiber', 'reconciliation', 'angular-vs-react']
  },
  {
    id: 'react_02',
    category: 'reactcore',
    topic: 'Hooks Lifecycle & Stale Closures',
    difficulty: 'Senior',
    question: 'How do useEffect, useLayoutEffect, and useRef work under the hood? What are Stale Closures and how do you prevent them?',
    shortAnswer: '`useEffect` runs asynchronously *after* browser paint. `useLayoutEffect` runs synchronously *before* paint (used for measuring DOM and avoiding layout flicker). `useRef` holds a persistent mutable reference that survives renders without triggering re-renders. Stale closures occur when an effect or callback captures an outdated variable from a past render without listing it in the dependency array.',
    interviewAnswer: 'React Hooks rely on array index positions internally to associate state with the Fiber node across renders:\n1. **`useEffect`**: Schedules a callback that executes asynchronously after the browser paints the screen. Best for data fetching, event listeners, and non-visual side effects.\n2. **`useLayoutEffect`**: Executes synchronously after React performs DOM mutations but *before* the browser paints pixels on screen. Use this when you must measure DOM dimensions (`getBoundingClientRect`) and synchronously adjust styles to prevent visual layout flicker.\n3. **`useRef`**: Returns `{ current: initialValue }`. Modifying `.current` does not trigger a re-render. Great for storing DOM node references, timer IDs, or previous state values.\n4. **Stale Closures**: Because JavaScript functions capture variables lexically at creation time, an effect or interval referencing `count` will always see its initial value (`0`) if `count` is omitted from the dependency array. Fix via functional updater `setCount(prev => prev + 1)` or adding the dependency.',
    spokenTip: 'useLayoutEffect runs before paint for DOM measurements; useEffect runs after paint; use functional state updates to fix stale closures.',
    example: {
      language: 'typescript',
      code: `import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

export function TimerWidget() {
  const [count, setCount] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 1. Stale Closure Prevention: Use functional updater
  useEffect(() => {
    const timer = setInterval(() => {
      // ✅ Correct: reads latest state without needing 'count' in deps!
      setCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer); // Teardown cleanup on unmount
  }, []);

  // 2. useLayoutEffect: Measure DOM synchronously before paint to avoid flicker
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        tooltipRef.current.style.left = \`\${window.innerWidth - rect.width}px\`;
      }
    }
  }, []);

  return <div>Count: {count} <div ref={tooltipRef}>Tooltip</div></div>;
}`,
      explanation: 'Demonstrates functional updater to prevent stale closures, useLayoutEffect for layout measurement, and useRef.'
    },
    seniorPoint: 'Never lie to React in dependency arrays by disabling ESLint `react-hooks/exhaustive-deps`. If an effect depends on a variable, either include it, move the logic inside the effect, or store the value in a `useRef` if you need read-only access without re-triggering the effect.',
    followUps: [
      {
        question: 'When does the cleanup function returned by `useEffect` execute?',
        answer: 'It executes before the effect re-runs on the next render (with the old closure values), and once when the component unmounts.'
      },
      {
        question: 'What is the difference between `useRef` and a plain variable declared outside the component?',
        answer: 'A variable declared outside the component is shared globally across all mounted instances of that component. `useRef` creates a distinct, isolated reference per component instance.'
      }
    ],
    keyPointsToMention: [
      'useEffect (async after paint) vs useLayoutEffect (sync before paint, prevents layout shifts)',
      'useRef stores mutable values across renders without causing re-renders',
      'Stale closure mechanism: lexical capture of outdated state in dependency-less closures',
      'Fixing stale closures via functional state updates (setCount(prev => prev + 1))'
    ],
    tags: ['react', 'hooks', 'useeffect', 'uselayouteffect', 'useref', 'stale-closures']
  },
  {
    id: 'react_03',
    category: 'reactcore',
    topic: 'Keys & Component Identity',
    difficulty: 'Senior',
    question: 'How do keys work in React list reconciliation, and what bugs occur when using array index as a key?',
    shortAnswer: 'Keys give React a stable identity to match virtual DOM nodes across renders. If items are reordered, added, or deleted, using the array index as key causes React to mutate existing DOM nodes and preserve incorrect internal component state (like inputs, checkboxes, or focus states). Unique stable IDs (e.g. `item.id`) must always be used.',
    interviewAnswer: 'During reconciliation, React diffs children by comparing their `type` and `key`:\n- If the `key` matches an existing node, React reuses that DOM node and Fiber instance, only patching modified attributes.\n- If a `key` changes, React completely destroys the old component (unmounting and resetting its local state) and creates a brand-new instance.\n\n**Why array index as key is an anti-pattern**:\nIf you have 3 items `[A, B, C]` with indices `0, 1, 2` and you delete item `A`, the remaining items `[B, C]` now receive indices `0, 1`. React assumes index `0` and `1` are the same components and simply updates their props, while deleting index `2`. If item `A` had an uncontrolled text input or checkbox state, that local state will visually bleed into item `B`! Always use stable, unique business IDs.',
    spokenTip: 'Keys establish persistent element identity. Using array indices leads to state corruption when items are inserted or removed.',
    example: {
      language: 'typescript',
      code: `// ❌ BAD: Using array index causes state leakage when deleting items
{items.map((item, index) => (
  <TodoItem key={index} item={item} />
))}

// ✅ GOOD: Using stable, unique entity ID
{items.map((item) => (
  <TodoItem key={item.id} item={item} />
))}

// Senior Pattern: Changing 'key' intentionally to force a full component state reset
export function UserProfile({ userId }: { userId: string }) {
  // Changing key unmounts old form and mounts fresh form with clean initial state!
  return <EditUserForm key={userId} userId={userId} />;
}`,
      explanation: 'Shows why entity IDs are mandatory for lists and how changing keys intentionally resets component state.'
    },
    seniorPoint: 'You can use `key` on individual non-list components as a clean architectural pattern: passing `key={userId}` forces React to unmount the entire component subtree and recreate its initial state from scratch when the user ID changes, eliminating manual reset logic.',
    followUps: [
      {
        question: 'When is it safe to use array index as a key?',
        answer: 'Only when the list is strictly static: it is never reordered, filtered, added to, or deleted, and items have zero internal state or uncontrolled inputs.'
      },
      {
        question: 'What happens if you use `Math.random()` as a key on every render?',
        answer: 'React treats every item as a brand-new component on every render, completely destroying and recreating the entire DOM tree, causing input focus loss and severe performance degradation.'
      }
    ],
    keyPointsToMention: [
      'Keys provide stable identity across Fiber reconciliation cycles',
      'Index as key bug: state retention in wrong items when inserting/deleting elements',
      'Entity IDs (item.id) guarantee correct DOM node reuse',
      'Using keys on standalone components to trigger deliberate full-tree state resets'
    ],
    tags: ['react', 'keys', 'reconciliation', 'lists', 'performance']
  },
  {
    id: 'react_04',
    category: 'reactcore',
    topic: 'useMemo vs useCallback & Re-rendering',
    difficulty: 'Senior',
    question: 'When should you actually use useMemo and useCallback, and what makes premature memoization harmful in React?',
    shortAnswer: '`useCallback` caches a function definition between renders. `useMemo` caches the result of an expensive calculation. You should only use them when passing callbacks or objects to memoized children (`React.memo`), when values are used in dependency arrays, or when calculating truly expensive computations. Overusing them adds memory and execution overhead for zero performance gain.',
    interviewAnswer: 'In React, component functions re-run from top to bottom on every state change. Every inline function (`() => {}`) and object literal (`{}`) gets a new memory reference on every single render.\n\nHowever, re-creating a simple function is extremely cheap for the JavaScript engine. You only need `useCallback` when that function is passed as a prop to a child wrapped in `React.memo`, or when it is listed in another hook\'s dependency array (like `useEffect`).\n\n`useMemo` is for caching CPU-heavy operations—like filtering or sorting 10,000 array items. If you wrap a simple `items.length > 0` check in `useMemo`, the cost of allocating the dependency array and running comparisons is higher than the calculation itself.',
    spokenTip: 'I only reach for `useCallback` when passing callbacks to `React.memo` components, and `useMemo` for heavy calculations or preserving object references in dependency arrays.',
    example: {
      language: 'typescript',
      code: `import React, { useState, useMemo, useCallback } from 'react';

export function ProductCatalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ✅ Good use of useMemo: Expensive filtering and sorting over large dataset
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
  }, [products, filter, sortOrder]);

  // ✅ Good use of useCallback: Passed to memoized child item
  const handleAddToCart = useCallback((productId: string) => {
    cartService.add(productId);
  }, []);

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <ProductList items={filteredProducts} onAdd={handleAddToCart} />
    </div>
  );
}`,
      explanation: 'Shows appropriate use of useMemo for heavy collection sorting and useCallback for callbacks passed to memoized children.'
    },
    seniorPoint: 'In Angular, methods on a component class stay bound to the instance across Change Detection cycles. In React, because components are pure functions, function references are recreated on every tick unless stabilized with `useCallback`.',
    followUps: [
      {
        question: 'Does `useCallback(fn, deps)` do anything other than `useMemo(() => fn, deps)`?',
        answer: 'No. `useCallback(fn, deps)` is syntactic sugar for `useMemo(() => fn, deps)` specifically designed for function definitions.'
      },
      {
        question: 'How does React 19 Compiler change the need for `useMemo` and `useCallback`?',
        answer: 'The React Compiler analyzes data flow at build time and automatically memoizes values and callbacks, making manual `useMemo` and `useCallback` largely unnecessary in new codebases.'
      }
    ],
    keyPointsToMention: [
      'useCallback memoizes function instances; useMemo memoizes computed return values',
      'Passing callbacks to React.memo children requires useCallback to preserve referential equality',
      'Overuse overhead: memory allocation for dependency arrays and shallow comparison costs',
      'Contrast with Angular class instance methods'
    ],
    tags: ['react', 'usememo', 'usecallback', 'performance', 'memoization', 'hooks']
  },
  {
    id: 'react_05',
    category: 'reactcore',
    topic: 'Controlled vs Uncontrolled Forms & Performance',
    difficulty: 'Senior',
    question: 'What is the difference between Controlled and Uncontrolled components in React, and why do libraries like React Hook Form prefer uncontrolled inputs for large forms?',
    shortAnswer: 'Controlled components bind input value and change handlers directly to React state (`value={state}`, `onChange={setState}`), causing the entire component to re-render on every keystroke. Uncontrolled components let the browser DOM manage input state natively and read values on demand via `useRef`. React Hook Form uses uncontrolled inputs to eliminate keystroke re-renders across large forms.',
    interviewAnswer: 'In React form architecture:\n- **Controlled Components**: React state is the single source of truth. Every keystroke updates state, triggering a re-render of the component and all children. This is great for instant field validation, dynamic formatting (like credit card masking), and conditional inputs, but scales poorly on 50-field enterprise forms.\n- **Uncontrolled Components**: The DOM maintains its own input state natively. You read the value when needed (e.g. on form submit) using `useRef` or `FormData`.\n- **Modern Standard (React Hook Form)**: It registers DOM inputs directly via ref subscriptions. It only re-renders the specific field that failed validation rather than re-rendering the entire form on every character typed, delivering 60fps typing performance.',
    spokenTip: 'Controlled inputs re-render on every keystroke; uncontrolled inputs let the DOM hold state and use refs, giving much better performance on large forms.',
    example: {
      language: 'typescript',
      code: `// 1. Controlled Input (Re-renders component on EVERY keystroke)
function ControlledInput() {
  const [val, setVal] = useState('');
  console.log('Re-rendered!');
  return <input value={val} onChange={e => setVal(e.target.value)} />;
}

// 2. Uncontrolled with React Hook Form (Zero unnecessary re-renders)
import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  age: number;
}

export function EnterpriseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Submitting without keystroke re-renders:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Uncontrolled ref binding */}
      <input {...register('email', { required: 'Email required' })} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}`,
      explanation: 'Compares controlled state re-renders with uncontrolled ref registration via React Hook Form.'
    },
    seniorPoint: 'Controlled inputs in React correspond to `[(ngModel)]` or `formControl.valueChanges` in Angular. In Angular, Reactive Forms separate model values from DOM rendering; in React, `useState` on a controlled input forces Virtual DOM diffing on every keystroke.',
    followUps: [
      {
        question: 'When MUST you use a controlled component instead of uncontrolled?',
        answer: 'When you need instant real-time UI reactions to input—such as an autocomplete suggestion dropdown, dynamic character count limiters, or disabling a submit button while typing.'
      },
      {
        question: 'How do you set initial default values in an uncontrolled component?',
        answer: 'Use `defaultValue="Initial Text"` or `defaultChecked={true}` instead of `value` or `checked`.'
      }
    ],
    keyPointsToMention: [
      'Controlled: React state holds value, triggers render on every keystroke',
      'Uncontrolled: DOM holds value, read via useRef or FormData',
      'React Hook Form uncontrolled architecture for high-performance forms',
      'Comparison to Angular Reactive Forms and ngModel'
    ],
    tags: ['react', 'forms', 'controlled-components', 'uncontrolled-components', 'react-hook-form', 'performance']
  },
  {
    id: 'react_06',
    category: 'reactcore',
    topic: 'Component Composition vs Context Prop Drilling',
    difficulty: 'Senior',
    question: 'How does Component Composition solve Prop Drilling without using Context or global state? What is the "children as slots" pattern?',
    shortAnswer: 'Component Composition solves prop drilling by passing instantiated React elements as `children` or explicit JSX props (e.g. `leftSlot={<Avatar />}`). Because the child element is evaluated in the parent’s scope, intermediate container components do not need to receive, pass, or re-render when that prop changes.',
    interviewAnswer: 'Before jumping to Context API or Redux to fix prop drilling, senior engineers use **Component Composition**:\n1. Instead of passing `user` down 5 layers (`Page -> Layout -> Header -> Nav -> UserProfile`), we instantiate `<UserProfile user={user} />` at the top level and pass it down as `{children}` or `userSlot={<UserProfile user={user} />}`.\n2. **Performance Benefit**: The intermediate components (`Layout`, `Header`, `Nav`) do not know or care about `user`. When `user` updates, only `UserProfile` and `Page` re-render; the intermediate layout components do NOT re-render!\n3. This is React\'s equivalent of Angular\'s `<ng-content select="...">` multi-slot projection.',
    spokenTip: 'Before adding Context or Redux for prop drilling, lift components up and pass them as children or slot props.',
    example: {
      language: 'typescript',
      code: `import React, { ReactNode } from 'react';

// Intermediate layout component: completely unaware of user data!
function AppHeader({ leftSlot, rightSlot }: { leftSlot: ReactNode; rightSlot: ReactNode }) {
  return (
    <header className="header">
      <div className="left">{leftSlot}</div>
      <div className="right">{rightSlot}</div>
    </header>
  );
}

// Top-level page: instantiates slots directly without prop drilling
export function DashboardPage({ user }: { user: User }) {
  return (
    <div>
      <AppHeader
        leftSlot={<h1>Dashboard</h1>}
        rightSlot={<UserAvatar user={user} />} // user passed directly here!
      />
      <main>Content</main>
    </div>
  );
}`,
      explanation: 'Demonstrates slot-based composition passing instantiated JSX elements to eliminate intermediate prop drilling.'
    },
    seniorPoint: 'Using the `children` prop creates a powerful performance optimization: when `AppHeader` re-renders due to its own internal state, React reuses the existing `children` element object without re-rendering the child tree.',
    followUps: [
      {
        question: 'How is React slot composition similar to Angular Content Projection?',
        answer: 'In Angular, `<ng-content select="[header]">` projects templates from the parent scope. In React, any prop can accept JSX (`headerSlot={<Header />}`), providing native multi-slot composition.'
      },
      {
        question: 'When does Component Composition fail and require Context API?',
        answer: 'When data is truly ambient and deeply needed by dozens of independent leaf components across the entire tree—such as Theme, Localization (i18n), or Authenticated User Session.'
      }
    ],
    keyPointsToMention: [
      'Passing JSX elements as children or named slot props',
      'Evaluation of children in parent scope avoids intermediate prop passing',
      'Performance: intermediate layout containers bypass re-renders',
      'Analogy to Angular multi-slot content projection (ng-content)'
    ],
    tags: ['react', 'component-composition', 'prop-drilling', 'slots', 'architecture', 'patterns']
  },
  {
    id: 'react_07',
    category: 'reactcore',
    topic: 'Context API Performance & Re-render Pitfalls',
    difficulty: 'Senior',
    question: 'Why does React Context often cause severe performance issues in large apps, and how do you design Context properly to prevent unnecessary re-renders?',
    shortAnswer: 'When a Context value changes, React forces EVERY component that calls `useContext(MyContext)` to re-render, even if the component only uses an unchanged property. To fix this: 1) Split big contexts into smaller, focused contexts (e.g. `UserContext` and `UserThemeContext`), 2) Separate State Context from Dispatch/Actions Context, and 3) Memoize the context value object with `useMemo`.',
    interviewAnswer: 'Context is designed for low-frequency global data (Theme, Locale, Current User). When developers put high-frequency state (like form inputs or active dashboard filters) into a single monolithic Context object:\n1. If property `A` updates, components that only read property `B` are still forced to re-render because `useContext` subscribes to the entire object reference.\n2. Unlike Redux or Zustand, Context lacks fine-grained selectors.\n\n**Best practice architecture for Context**:\n- **Separate State & Dispatch**: Create `CountStateContext` (for reading value) and `CountDispatchContext` (for actions/setters). Components that only trigger actions never re-render when state changes.\n- **Memoize Provider Value**: Always wrap provider value in `useMemo(() => ({ state, dispatch }), [state])` to prevent re-renders on unrelated parent renders.',
    spokenTip: 'Context triggers re-renders on all consumers when its value updates; separate state from dispatch and split large contexts into smaller ones.',
    example: {
      language: 'typescript',
      code: `import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';

// 1. Separate State and Dispatch Contexts
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<AuthDispatch | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Memoize state value
  const stateValue = useMemo(() => state, [state]);

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

// Custom hook with null check
export function useAuthState() {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error('useAuthState must be used within AuthProvider');
  return ctx;
}

export function useAuthDispatch() {
  const ctx = useContext(AuthDispatchContext);
  if (!ctx) throw new Error('useAuthDispatch must be used within AuthProvider');
  return ctx;
}`,
      explanation: 'Splits state from dispatch into separate context providers and memoizes the state object.'
    },
    seniorPoint: 'If you need high-frequency updates with granular selector subscriptions (e.g. only re-render when `state.user.preferences.theme` changes), use Zustand or TanStack Query instead of React Context.',
    followUps: [
      {
        question: 'Why doesn\'t `React.memo` prevent a component from re-rendering if it consumes a changed Context?',
        answer: '`useContext` bypasses `React.memo`. When the context value changes, React forces the consuming component to re-render regardless of whether its props are memoized.'
      },
      {
        question: 'How does React 19 `use(Context)` differ from `useContext(Context)`?',
        answer: '`use(Context)` can be called conditionally inside `if` statements and loops, whereas `useContext` was restricted by traditional Hook rules.'
      }
    ],
    keyPointsToMention: [
      'Context lacks built-in selector subscriptions: all consumers re-render on any change',
      'Splitting State Context and Dispatch Context',
      'Memoizing Context provider value object with useMemo',
      'When to graduate from Context to Zustand/TanStack Query for high-frequency data'
    ],
    tags: ['react', 'context-api', 'performance', 'usecontext', 'state-management', 're-renders']
  },
  {
    id: 'react_08',
    category: 'reactcore',
    topic: 'Error Boundaries & Suspense',
    difficulty: 'Senior',
    question: 'How do Error Boundaries work in React, what errors can they NOT catch, and how does Suspense coordinate fallback loading states?',
    shortAnswer: 'Error Boundaries are class components implementing `componentDidCatch` or `getDerivedStateFromError` to catch rendering errors in child components and display fallback UI without crashing the whole app. They do NOT catch errors in event handlers, async code (`fetch`), or SSR. `Suspense` catches thrown Promises during rendering and displays fallback spinners until async work resolves.',
    interviewAnswer: 'In React, an unhandled JavaScript error during rendering unmounts the entire component tree and displays a blank white screen.\n\n1. **Error Boundaries**: Wrap critical subtrees (e.g. widget grids or route views). When a child component throws during render, lifecycle, or constructors, `getDerivedStateFromError` updates state to render a fallback UI, while `componentDidCatch` logs the error to Sentry/DataDog.\n2. **Limitations**: Error Boundaries do *not* catch errors inside `onClick` event handlers (use standard `try/catch` there) or asynchronous `setTimeout` / `fetch` callbacks.\n3. **Suspense**: Coordinates async components or lazy-loaded bundles (`React.lazy`). When a child suspends by throwing a Promise, React pauses rendering that child, displays the `<Suspense fallback={<Spinner />}>`, and resumes rendering once the Promise resolves.',
    spokenTip: 'Error Boundaries catch render errors and prevent white screens; Suspense catches thrown promises to manage loading spinners declaratively.',
    example: {
      language: 'typescript',
      code: `import React, { Component, ErrorInfo, ReactNode, Suspense, lazy } from 'react';

// 1. Error Boundary Component (Class component required)
interface Props { children: ReactNode; fallback: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Logged to Sentry:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// 2. Combining Error Boundary with Suspense for Lazy Route Loading
const HeavyAnalyticsDashboard = lazy(() => import('./HeavyAnalyticsDashboard'));

export function AnalyticsView() {
  return (
    <ErrorBoundary fallback={<div className="error">Failed to load analytics dashboard.</div>}>
      <Suspense fallback={<div className="spinner">Loading dashboard modules...</div>}>
        <HeavyAnalyticsDashboard />
      </Suspense>
    </ErrorBoundary>
  );
}`,
      explanation: 'Shows full ErrorBoundary implementation wrapped with Suspense for resilient lazy-loaded dashboards.'
    },
    seniorPoint: 'In modern React with TanStack Query, setting `useQuery({ ..., throwOnError: true })` bridges async fetch errors into Error Boundaries, giving unified declarative error handling across both render errors and API failures.',
    followUps: [
      {
        question: 'Why are Error Boundaries still written as class components in modern React?',
        answer: 'Because React has not yet introduced functional Hook equivalents for `componentDidCatch` or `getDerivedStateFromError`.'
      },
      {
        question: 'How do you reset an Error Boundary state when the user clicks a "Retry" button?',
        answer: 'Provide a reset method on the Error Boundary that sets `{ hasError: false }` and re-mounts the children.'
      }
    ],
    keyPointsToMention: [
      'getDerivedStateFromError for rendering fallback; componentDidCatch for logging/telemetry',
      'What Error Boundaries cannot catch: event handlers, async fetch, setTimeout, SSR',
      'Suspense for lazy chunks and declarative async data fetching',
      'Bridging async API errors to Error Boundaries via TanStack Query throwOnError'
    ],
    tags: ['react', 'error-boundaries', 'suspense', 'react-lazy', 'resilience', 'error-handling']
  }
];
