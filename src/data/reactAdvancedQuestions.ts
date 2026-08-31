import { Question } from '../types';

export const reactAdvancedQuestions: Question[] = [
  {
    id: 'reactadv_01',
    category: 'reactadvanced',
    topic: 'Server State vs Client State',
    difficulty: 'Senior',
    question: 'How do you separate Server State from Client State? Contrast TanStack Query (React Query) with Zustand/Redux for caching, background refetching, and optimistic updates.',
    shortAnswer: 'Server State is remote, asynchronous, shared, and can become stale. Client State is synchronous, local, and owned by the UI. Using TanStack Query for Server State gives automatic deduplication, stale-while-revalidate caching, and optimistic mutations, while lightweight libraries like Zustand handle UI client state (modals, active tabs, themes).',
    interviewAnswer: 'A major breakthrough in frontend architecture is recognizing that Server State and Client State are fundamentally different:\n- **Server State**: Resides remotely on a backend database. It is asynchronous, requires caching and background synchronization, and can be modified by other users. Trying to store server data in Redux requires massive boilerplate (actions, reducers, loading/error flags). **TanStack Query** manages server state with automated request deduplication, garbage collection, window focus refetching, and optimistic UI rollback.\n- **Client State**: Fully owned by the browser UI—e.g. sidebar collapse state, selected theme, multi-step wizard step. We use lightweight stores like **Zustand** for global UI state, eliminating 90% of legacy Redux boilerplate.',
    spokenTip: 'Separate state by ownership: use TanStack Query for remote server state caching, and Zustand for local UI client state.',
    example: {
      language: 'typescript',
      code: `import { useMutation, useQueryClient } from '@tanstack/react-query';

// Optimistic Update with TanStack Query
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedTodo: Todo) => api.patch(\`/todos/\${updatedTodo.id}\`, updatedTodo),
    
    // When mutate is called:
    onMutate: async (newTodo) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      // 2. Snapshot previous value for rollback
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      // 3. Optimistically update cache immediately!
      queryClient.setQueryData<Todo[]>(['todos'], old => 
        old?.map(t => t.id === newTodo.id ? { ...t, ...newTodo } : t)
      );
      return { previousTodos };
    },
    // On error, roll back to snapshot!
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });
}`,
      explanation: 'Demonstrates optimistic mutation with snapshot rollback in TanStack Query.'
    },
    seniorPoint: 'Optimistic updates provide instant UI feedback (<16ms), but always require: 1) Cancelling in-flight queries to avoid race conditions, 2) Storing a previous snapshot for rollback on error, and 3) Calling `invalidateQueries()` on settle to ensure consistency with backend database state.',
    followUps: [
      {
        question: 'What is the Stale-While-Revalidate pattern in TanStack Query?',
        answer: 'TanStack Query serves cached data to the UI instantly (avoiding loading spinners) while triggering a background fetch to verify if fresh data exists, updating the UI seamlessly if changes occurred.'
      },
      {
        question: 'Why is Zustand preferred over Redux Toolkit for pure client state?',
        answer: 'Zustand is hook-based, has zero Context Provider wrapper requirements, minimal bundle footprint (<1KB), and supports fine-grained selector subscriptions to prevent unnecessary component re-renders.'
      }
    ],
    keyPointsToMention: [
      'Server State (remote, async, stale-prone) vs Client State (sync, local UI)',
      'TanStack Query: automatic deduplication, garbage collection, focus revalidation',
      'Optimistic update lifecycle: cancelQueries -> snapshot -> setQueryData -> onError rollback -> onSettled invalidate',
      'Zustand for client UI state'
    ],
    tags: ['react', 'tanstack-query', 'zustand', 'state-management', 'optimistic-updates', 'caching']
  },
  {
    id: 'reactadv_02',
    category: 'reactadvanced',
    topic: 'React Server Components (RSC)',
    difficulty: 'Senior',
    question: 'How do React Server Components (RSC) work? Contrast Server Components with Client Components ("use client") and explain Hydration boundaries.',
    shortAnswer: 'React Server Components (RSC) execute exclusively on the server, have direct access to backend resources (DB, filesystem), and emit zero JavaScript to the client bundle. Client Components (`"use client"`) execute on the server during initial SSR and hydrate on the browser with interactive JavaScript. RSC reduces client bundle size while keeping interactive components client-side.',
    interviewAnswer: 'React Server Components fundamentally split rendering responsibilities:\n- **Server Components (Default)**: Render only on the server and stream a serialized Virtual DOM format (RSC Payload) to the browser. They can directly query databases via Prisma/EF Core, read filesystem files, and import heavy dependencies (like markdown parsers or date libraries) with **0 KB added to the browser JavaScript bundle**. They cannot use hooks (`useState`, `useEffect`) or browser DOM event listeners.\n- **Client Components (`"use client"`)**: Opt into client-side interactivity. They are pre-rendered on the server for initial HTML and hydrated in the browser with full event listeners and state hooks.\n- **Composition Rule**: Server Components can import and render Client Components. However, Client Components cannot directly import Server Components; they can only accept them as `children` props to maintain the server boundary.',
    spokenTip: 'Server Components run only on the server with 0 KB client JS; Client Components use "use client" for browser interactivity and hooks.',
    example: {
      language: 'typescript',
      code: `// 1. Server Component (Zero client JS bundle, direct DB access!)
// app/users/page.tsx (Default is Server Component)
import { db } from '@/lib/db';
import { UserSearchClient } from './UserSearchClient'; // Client Component

export default async function UsersPage() {
  // Direct async database query on server:
  const initialUsers = await db.users.findMany({ take: 20 });

  return (
    <main>
      <h1>Enterprise Directory</h1>
      {/* Passing server data and server children into client boundary */}
      <UserSearchClient initialUsers={initialUsers} />
    </main>
  );
}

// 2. Client Component (Interactive hook usage)
// app/users/UserSearchClient.tsx
'use client';

import { useState } from 'react';

export function UserSearchClient({ initialUsers }: { initialUsers: User[] }) {
  const [query, setQuery] = useState('');
  return (
    <input 
      value={query} 
      onChange={e => setQuery(e.target.value)} 
      placeholder="Filter users..." 
    />
  );
}`,
      explanation: 'Demonstrates async Server Component with direct DB access passing data to interactive "use client" component.'
    },
    seniorPoint: '`"use client"` does NOT mean "render only in the browser". Client Components are still pre-rendered into static HTML on the server during initial page load for fast Time to First Byte (TTFB), then hydrated in the browser.',
    followUps: [
      {
        question: 'Why can\'t a Client Component import a Server Component directly?',
        answer: 'Because importing a Server Component inside a file marked `"use client"` forces the bundler to include the imported code in the client JS bundle, breaking the server boundary.'
      },
      {
        question: 'How do you pass a Server Component inside a Client Component?',
        answer: 'Pass it as `children` or via a JSX prop from an outer Server Component. The Client Component renders `{children}` as an opaque serialized slot without needing to bundle the server code.'
      }
    ],
    keyPointsToMention: [
      'RSC: Server-only execution, zero client JS bundle, direct backend/DB access',
      'Client Components: "use client" directive, supports useState/useEffect/event handlers',
      'RSC serialization format (JSON-like stream over HTTP)',
      'Hydration boundaries and children prop composition pattern'
    ],
    tags: ['react', 'rsc', 'nextjs', 'server-components', 'ssr', 'hydration', 'bundle-size']
  },
  {
    id: 'reactadv_03',
    category: 'reactadvanced',
    topic: 'Profiling & Re-render Elimination',
    difficulty: 'Senior',
    question: 'How do you diagnose and eliminate unnecessary React re-renders? Compare React.memo, useCallback, useMemo, and Component Composition.',
    shortAnswer: 'Diagnose re-renders using the React DevTools Profiler (highlighting render reasons). Eliminate re-renders primarily through **Component Composition** (moving state down or lifting content as `children`), and secondarily via `React.memo` paired with `useCallback` (for stable function references) and `useMemo` (for expensive computations).',
    interviewAnswer: 'In React, when a parent component renders, by default *all* child components re-render recursively, regardless of whether their props changed.\n\nMy systematic approach to eliminate re-renders:\n1. **Diagnostic Profiling**: Open React DevTools Profiler -> Record user interaction -> Inspect "Why did this render?". Check for prop reference changes.\n2. **Component Composition (Best Practice)**: Move state down to the lowest sub-component that actually needs it. Alternatively, pass static subtrees as `children` props (`<Parent><ExpensiveChild /></Parent>`). When `Parent` re-renders due to its internal state, `ExpensiveChild` was created in the outer scope and does NOT re-render!\n3. **`React.memo`**: Wraps a component to perform shallow comparison of props (`prevProps === nextProps`).\n4. **`useCallback` & `useMemo`**: Mandatory when passing callbacks or object props to `React.memo` children. Without `useCallback`, inline arrow functions create new memory references on every parent render, breaking `React.memo`.',
    spokenTip: 'First fix re-renders with component composition and moving state down; only add React.memo and useCallback when necessary.',
    example: {
      language: 'typescript',
      code: `import React, { useState, memo, useCallback, useMemo } from 'react';

// 1. Memoized Child Component
const ExpensiveDataGrid = memo(function ExpensiveDataGrid({
  data,
  onRowClick
}: {
  data: number[];
  onRowClick: (id: number) => void;
}) {
  console.log('Rendering ExpensiveDataGrid');
  return <div>{data.length} Rows Rendered</div>;
});

export function ParentDashboard() {
  const [counter, setCounter] = useState(0);
  const [filterText, setFilterText] = useState('');

  // ✅ Stable callback reference across renders
  const handleRowClick = useCallback((id: number) => {
    console.log('Clicked row:', id);
  }, []);

  // ✅ Memoize expensive data calculation
  const gridData = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => i * 2);
  }, []);

  return (
    <div>
      <button onClick={() => setCounter(c => c + 1)}>Counter: {counter}</button>
      {/* ExpensiveDataGrid will NOT re-render when counter increments! */}
      <ExpensiveDataGrid data={gridData} onRowClick={handleRowClick} />
    </div>
  );
}`,
      explanation: 'Combines React.memo with useCallback and useMemo to prevent downstream re-renders.'
    },
    seniorPoint: 'Applying `React.memo` and `useCallback` everywhere blindly has a performance cost: React must allocate memory for dependency arrays and run shallow comparisons on every render. If a component is cheap or its props always change, `memo` adds overhead with zero benefit.',
    followUps: [
      {
        question: 'Why does passing an inline object `{ color: "red" }` to a `React.memo` component cause it to re-render?',
        answer: 'Because `{}` creates a new object instance with a different memory reference on every render. `React.memo` performs shallow `===` comparison, detects a reference change, and re-renders.'
      },
      {
        question: 'What is the React Compiler (React Forget) in React 19?',
        answer: 'An automated build-time compiler that memoizes components, values, and callbacks automatically, eliminating the need for manual `useMemo`, `useCallback`, and `React.memo` in most code.'
      }
    ],
    keyPointsToMention: [
      'Default React behavior: parent render cascades to all children',
      'Diagnosis with React DevTools Profiler ("Record why each component rendered")',
      'Component Composition (children prop) as the cleanest memoization alternative',
      'React.memo requires stable useCallback/useMemo prop references to work',
      'Overhead of premature memoization'
    ],
    tags: ['react', 'performance', 'profiling', 'memo', 'usecallback', 'usememo', 're-renders']
  },
  {
    id: 'reactadv_04',
    category: 'reactadvanced',
    topic: 'Compound Components & Headless Design Systems',
    difficulty: 'Senior',
    question: 'How do you implement the Compound Component pattern in React, and why do modern design systems use headless primitives (Radix UI / Shadcn)?',
    shortAnswer: 'The Compound Component pattern shares implicit state among a set of related sub-components via Context (e.g. `<Select><Select.Trigger /><Select.Content><Select.Item /></Select>`). Headless libraries (Radix UI / React Aria) provide 100% accessible WAI-ARIA behavior, keyboard navigation, and state logic with zero CSS, letting you style with Tailwind or CSS Modules without fighting pre-baked styles.',
    interviewAnswer: 'Traditional UI components rely on "prop explosions" (e.g. `<Select options={items} isMulti hasSearch customRenderOption={...} />`), making them rigid and hard to customize.\n\n**Compound Component Pattern**:\n1. The parent container (`<Tabs>`) holds the active state in an internal React Context.\n2. Sub-components (`<Tabs.List>`, `<Tabs.Trigger>`, `<Tabs.Content>`) consume that context implicitly.\n3. Consumers have complete control over template layout and DOM hierarchy without prop drilling.\n\n**Why Headless UI (Radix / Shadcn UI) is the enterprise standard**:\nBuilding accessible dropdowns, modals, and tooltips requires hundreds of lines of focus trapping, ARIA roles, and keyboard event handling. Headless primitives handle all accessibility and state mechanics natively, allowing frontend teams to apply custom design systems using Tailwind CSS.',
    spokenTip: 'Compound components share implicit state via Context to avoid prop explosion; headless primitives like Radix give you full accessibility logic without forced CSS.',
    example: {
      language: 'typescript',
      code: `import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Internal Context for Implicit State
const AccordionContext = createContext<{
  activeId: string | null;
  toggle: (id: string) => void;
} | null>(null);

// 2. Parent Compound Container
export function Accordion({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const toggle = (id: string) => setActiveId(prev => prev === id ? null : id);

  return (
    <AccordionContext.Provider value={{ activeId, toggle }}>
      <div className="accordion-root">{children}</div>
    </AccordionContext.Provider>
  );
}

// 3. Sub-components consuming context
Accordion.Item = function AccordionItem({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be inside Accordion');

  const isOpen = ctx.activeId === id;

  return (
    <div className="accordion-item">
      <button onClick={() => ctx.toggle(id)} aria-expanded={isOpen}>
        {title}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

// Usage:
// <Accordion>
//   <Accordion.Item id="1" title="Billing FAQ">Details here...</Accordion.Item>
// </Accordion>`,
      explanation: 'Implements Compound Component pattern sharing activeId state implicitly through React Context.'
    },
    seniorPoint: 'In Angular, compound components are typically built using Content Projection (`<ng-content>`) paired with `@ContentChildren(ItemComponent)` queries. In React, Context provides the implicit communication channel.',
    followUps: [
      {
        question: 'What is the trade-off of the Compound Component pattern?',
        answer: 'Consumers can accidentally place sub-components outside the provider context if they render them in arbitrary portals or wrappers, requiring clear error assertions (`if (!ctx) throw Error(...)`).'
      },
      {
        question: 'Why has Shadcn UI gained massive popularity over component libraries like MUI or AntD?',
        answer: 'Because Shadcn UI copies headless, accessible Radix code directly into your repository, giving full code ownership and easy customization with Tailwind CSS without version lock-in.'
      }
    ],
    keyPointsToMention: [
      'Compound components eliminate prop explosion by sharing implicit context',
      'Flexible JSX layout controlled by consumer',
      'Headless UI primitives provide WAI-ARIA and keyboard mechanics with zero styling opinions',
      'Comparison to Angular @ContentChildren and Content Projection'
    ],
    tags: ['react', 'design-systems', 'compound-components', 'headless-ui', 'radix', 'shadcn', 'architecture']
  },
  {
    id: 'reactadv_05',
    category: 'reactadvanced',
    topic: 'Authentication & Refresh Token Interceptors',
    difficulty: 'Senior',
    question: 'How do you architect Authentication with Access & Refresh Tokens in React + ASP.NET Core, and how do you handle concurrent 401 token refresh requests?',
    shortAnswer: 'Store short-lived JWT access tokens in memory (or HttpOnly cookies) and refresh tokens in HttpOnly Secure SameSite cookies. Configure an Axios/Fetch interceptor: on 401, pause pending requests in a queue, trigger a single refresh token request, and replay all queued requests with the new access token once resolved.',
    interviewAnswer: 'In modern full-stack architectures (React + ASP.NET Core):\n1. **Storage Security**: Never store long-lived tokens in `localStorage` due to XSS vulnerability. Store the Refresh Token in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie that JavaScript cannot read. Store the Access Token in JavaScript memory or React state.\n2. **401 Interceptor Queueing**: When multiple API calls (e.g. 5 dashboard widgets) fire concurrently and the access token expires, all 5 calls return 401 simultaneously.\n3. **Concurrency Solution**: Maintain an `isRefreshing` boolean flag and a `failedQueue` array. The first 401 sets `isRefreshing = true` and calls `/api/auth/refresh`. The remaining 4 calls push their Promises into `failedQueue`. When refresh succeeds, resolve all queued promises with the new token and resume network requests seamlessly.',
    spokenTip: 'Never store tokens in localStorage; use an Axios 401 interceptor queue to handle token refresh concurrency across parallel requests.',
    example: {
      language: 'typescript',
      code: `import axios from 'axios';

const apiClient = axios.create({ baseURL: '/api' });

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue concurrent requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = \`Bearer \${token}\`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh-token');
        const newAccessToken = data.accessToken;
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = \`Bearer \${newAccessToken}\`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);`,
      explanation: 'Axios response interceptor queueing concurrent 401 requests during token refresh.'
    },
    seniorPoint: 'If the user has multiple browser tabs open and the access token expires, all tabs might attempt to refresh concurrently. Use `BroadcastChannel` or a shared Web Worker to synchronize token refreshes across browser tabs.',
    followUps: [
      {
        question: 'Why is storing tokens in `localStorage` risky?',
        answer: 'Any third-party script or XSS injection can execute `localStorage.getItem("token")` and exfiltrate credentials to an attacker server.'
      },
      {
        question: 'How do you protect against CSRF when using HttpOnly cookies for authentication?',
        answer: 'Use `SameSite=Lax` or `SameSite=Strict` cookie attributes, combined with custom headers like `X-Requested-With` or Anti-Forgery CSRF tokens in ASP.NET Core.'
      }
    ],
    keyPointsToMention: [
      'Token storage: Memory for Access Token, HttpOnly SameSite cookie for Refresh Token',
      'Interceptor response queueing to prevent multiple simultaneous refresh requests',
      'Handling multi-tab refresh synchronization via BroadcastChannel',
      'Graceful session expiration redirect to login'
    ],
    tags: ['react', 'auth', 'jwt', 'security', 'interceptors', 'refresh-token', 'aspnetcore']
  },
  {
    id: 'reactadv_06',
    category: 'reactadvanced',
    topic: 'Virtualization & Massive Dataset Rendering',
    difficulty: 'Senior',
    question: 'How does List Virtualization (Windowing) work in React, and how do you render 100,000 records smoothly at 60fps?',
    shortAnswer: 'Virtualization renders only the small subset of DOM elements currently visible inside the viewport (plus a small overscan buffer), recycling DOM nodes as the user scrolls. Libraries like TanStack Virtual calculate total scroll height via a dummy spacer element and position visible items using CSS transforms, keeping the DOM node count under 50.',
    interviewAnswer: 'Rendering 10,000 DOM nodes in a standard `items.map()` causes severe performance degradation: the browser spends hundreds of milliseconds on DOM layout, style calculation, and painting, consuming massive RAM and causing janky scrolling.\n\n**How Virtualization (Windowing) works**:\n1. **Outer Container**: Has a fixed height with `overflow-y: auto` to provide the scrollbar.\n2. **Inner Spacer**: Has height equal to `totalItems * itemHeight` (e.g. 10,000 * 50px = 500,000px) so the browser scrollbar behaves naturally.\n3. **Viewport Calculation**: Reads container `scrollTop`, calculates `startIndex = Math.floor(scrollTop / itemHeight)` and `endIndex = startIndex + visibleCount + overscan`.\n4. Only the ~20 visible items are instantiated in the React Virtual DOM, positioned absolutely with `transform: translateY(...)`.\n5. Keeps the active DOM node count below 50 regardless of whether the dataset contains 1,000 or 1,000,000 items.',
    spokenTip: 'Virtualization only renders visible DOM items plus a buffer; it keeps the DOM tiny and scrolling smooth at 60fps regardless of dataset size.',
    example: {
      language: 'typescript',
      code: `import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer hook
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // 40px estimated row height
    overscan: 5 // Render 5 extra items above and below viewport
  });

  return (
    <div
      ref={parentRef}
      style={{ height: '400px', overflowY: 'auto', border: '1px solid #334155' }}
    >
      {/* Total scroll height spacer */}
      <div style={{ height: \`\${rowVirtualizer.getTotalSize()}px\`, position: 'relative', width: '100%' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: \`\${virtualRow.size}px\`,
              transform: \`translateY(\${virtualRow.start}px)\` // GPU transform positioning
            }}
          >
            Row {virtualRow.index}: {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}`,
      explanation: 'Uses TanStack Virtual with dynamic GPU transform positioning for 60fps list rendering.'
    },
    seniorPoint: 'In Angular, this is handled natively by `@angular/cdk/scrolling` via `<cdk-virtual-scroll-viewport>`. In React, TanStack Virtual is preferred because it is headless and supports dynamic row heights and grid tables.',
    followUps: [
      {
        question: 'How do you handle variable or dynamic row heights in a virtual list?',
        answer: 'Use `useVirtualizer` dynamic measurement with a `ref` on each item (`rowVirtualizer.measureElement`), which dynamically updates element bounds via `ResizeObserver`.'
      },
      {
        question: 'Why use `transform: translateY()` instead of `top: ...px` for positioning virtual items?',
        answer: '`transform` runs on the GPU compositor thread without triggering layout and paint, ensuring 60fps smooth scrolling during high-velocity scroll gestures.'
      }
    ],
    keyPointsToMention: [
      'Windowing concept: DOM node count remains constant (~20-50 nodes) regardless of dataset size',
      'Calculation: scrollTop / rowHeight to determine startIndex and endIndex + overscan',
      'Spacer div maintains authentic scrollbar travel',
      'Comparison to Angular CDK Virtual Scroll'
    ],
    tags: ['react', 'virtualization', 'tanstack-virtual', 'performance', 'windowing', 'large-lists']
  },
  {
    id: 'reactadv_07',
    category: 'reactadvanced',
    topic: 'Angular vs React Architecture & Mental Models',
    difficulty: 'Senior',
    question: 'As a Senior Engineer, compare the architectural mental models of Angular and React. How do Dependency Injection, State, and Templates differ?',
    shortAnswer: 'Angular is a full-featured framework with opinionated TypeScript structure, hierarchical Dependency Injection, RxJS/Signals reactivity, and compile-time template syntax. React is a lightweight UI library with functional component re-execution, Virtual DOM diffing, JSX, Custom Hooks, and un-opinionated third-party ecosystem choices.',
    interviewAnswer: 'When moving between Angular and React at a senior level, the major architectural contrasts are:\n\n1. **Component Execution**:\n   - *Angular*: Instantiates a class once. Methods and properties persist across change detection cycles. Modern Angular uses fine-grained Signals for targeted DOM updates.\n   - *React*: Functional components re-execute entirely from top to bottom on every state change. Object and function references are recreated on every render unless stabilized with `useMemo`/`useCallback`.\n2. **Dependency Injection vs Hooks**:\n   - *Angular*: Hierarchical DI system (`ElementInjector` vs `EnvironmentInjector`) for singleton services and modular testing.\n   - *React*: No built-in DI; uses Custom Hooks (`useAuth()`), React Context, or modular singletons.\n3. **Async & Server State**:\n   - *Angular*: RxJS Observables (`HttpClient`, `switchMap`, async pipe) and Signals.\n   - *React*: TanStack Query for server state caching; Promises and async/await with custom hooks.\n4. **Templates**:\n   - *Angular*: HTML templates with ahead-of-time compiled control flow (`@if`, `@for`).\n   - *React*: JSX—JavaScript with HTML syntax, giving full JavaScript expressiveness directly in UI rendering.',
    spokenTip: 'Angular is an opinionated framework with class instances, DI, and compiled templates; React is a function-first library with top-down re-execution, JSX, and custom hooks.',
    example: {
      language: 'typescript',
      code: `// --- Angular Architecture Pattern ---
// @Injectable({ providedIn: 'root' })
// export class UserService {
//   private http = inject(HttpClient);
//   users$ = this.http.get<User[]>('/api/users');
// }
// @Component({ template: \`@for (u of users$ | async; track u.id) { <li>{{ u.name }}</li> }\` })

// --- React Equivalent Pattern ---
import { useQuery } from '@tanstack/react-query';

export function UserList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {users?.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}`,
      explanation: 'Contrasts Angular Injectable service + async pipe with React TanStack Query + JSX mapping.'
    },
    seniorPoint: 'When migrating an enterprise app from Angular to React, avoid trying to rebuild Angular\'s DI and RxJS architecture inside React with complex Context wrappers. Embrace idiomatic React: Custom Hooks for logic reuse and TanStack Query for server state.',
    followUps: [
      {
        question: 'Why doesn\'t React need a Dependency Injection framework?',
        answer: 'Because React functions and Custom Hooks compose naturally via module imports, function arguments, and React Context without requiring runtime container reflection.'
      },
      {
        question: 'How do Signals in modern Angular 17+ compare to React State Hooks?',
        answer: 'Angular Signals track dependencies automatically at runtime and notify exact DOM nodes directly, whereas React `useState` schedules a whole-component re-render and VDOM diff.'
      }
    ],
    keyPointsToMention: [
      'Framework (Angular) vs Library (React)',
      'Class instances + DI vs Pure functional re-execution + Custom Hooks',
      'RxJS async pipes vs TanStack Query',
      'HTML compiled templates (@if/@for) vs JSX JavaScript expressiveness',
      'Signals fine-grained reactivity vs VDOM Fiber reconciliation'
    ],
    tags: ['react', 'angular', 'architecture', 'mental-model', 'dependency-injection', 'senior-comparison']
  }
];
