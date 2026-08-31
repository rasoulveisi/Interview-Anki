import { Question } from '../types';

export const reactAdvancedQuestions: Question[] = [
  {
    id: 'reactadv_01',
    category: 'reactadvanced',
    topic: 'Server State vs Client State (TanStack Query vs Redux/Zustand)',
    difficulty: 'Senior',
    question: 'Why has Server State (TanStack Query / SWR) largely replaced Redux for data fetching, and when is Zustand/Redux still necessary for Client State?',
    shortAnswer: 'Server state is remote, asynchronous, shared, and requires caching, deduplication, background refetching, and pagination. TanStack Query specializes in server state with automatic cache invalidation and optimistic updates. Client state (Zustand / Redux) is synchronous, local to the browser session, and best suited for complex UI state (multi-step wizard state, drawing canvas toolbars, audio players).',
    seniorPoint: 'Using Redux for async data fetching requires hundreds of lines of boilerplate actions, reducers, and thunks/sagas just to manage `loading`, `data`, and `error` states. Separating server cache (TanStack Query) from synchronous UI state (Zustand) reduces frontend codebase size by up to 60%.',
    spokenTip: 'Separate Server Cache from Client UI State: use TanStack Query for remote APIs and Zustand for synchronous browser state.',
    interviewAnswer: 'In modern React architecture, we bifurcate state into two categories:\n1. **Server State (Remote Cache)**: Owned by the server. React only holds a temporary snapshot. Requires background polling, window-focus refetching, mutation rollbacks, and LRU garbage collection. **TanStack Query** handles this declaratively via `useQuery` and `useMutation`, eliminating manual `useEffect` fetching.\n2. **Client State (Ephemeral UI State)**: Owned by the browser. Purely synchronous. Examples: sidebar open/closed, theme preference, active multi-step wizard step. **Zustand** is the preferred lightweight store (no boilerplate, hook-based, selector memoization) without Context re-render cascades.\n\nIn Angular, this is analogous to using HttpClient with RxJS caching or NgRx vs local SignalStores.',
    keyPointsToMention: [
      'Server State: Asynchronous, remote ownership, caching, refetch on window focus',
      'Client State: Synchronous, ephemeral browser ownership',
      'TanStack Query: queryKey-based cache invalidation and optimistic UI updates',
      'Zustand / Redux Toolkit for complex synchronous client state'
    ],
    whatInterviewersLookFor: [
      'Ability to explain why Redux was historically overused for async caching',
      'Understanding of optimistic update rollbacks in TanStack Query'
    ],
    codeExample: `// 1. Server State with TanStack Query & Optimistic Update
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedTodo: Todo) => api.put(\`/todos/\${updatedTodo.id}\`, updatedTodo),
    // Optimistic Update: update UI immediately before server confirms!
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => 
        old.map(t => t.id === newTodo.id ? newTodo : t)
      );
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      // Rollback on failure
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });
}

// 2. Client UI State with Zustand (Clean & Zero Boilerplate)
import { create } from 'zustand';

interface UiStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
}));`,
    tags: ['reactadvanced', 'tanstack-query', 'react-query', 'zustand', 'server-state', 'redux', 'optimistic-updates']
  },
  {
    id: 'reactadv_02',
    category: 'reactadvanced',
    topic: 'React Server Components (RSC) vs Client Components',
    difficulty: 'Senior',
    question: 'How do React Server Components (RSC) work in Next.js App Router? Contrast Server Components, Client Components (`"use client"`), SSR, and Hydration.',
    shortAnswer: 'React Server Components (RSC) execute exclusively on the server at request/build time, have direct access to backend databases/filesystems, and stream serialized Virtual DOM (Flight payload) to the browser with **0 KB JavaScript bundle size**. Client Components (`"use client"`) render on both server (SSR HTML) and client, and are hydrated with JS for interactivity (`useState`, `onClick`, browser APIs).',
    seniorPoint: '`"use client"` does NOT mean "render only on the client". Client components are still pre-rendered to HTML on the server during Initial Server-Side Rendering (SSR). `"use client"` marks the boundary where JavaScript must be sent to the browser for interactive hydration.',
    spokenTip: 'Server Components stream zero-JS rendered UI from the backend; Client Components hydrate JavaScript for user interactivity.',
    interviewAnswer: '1. **React Server Components (RSC)**:\n   - Default in Next.js App Router.\n   - Execute only on the server. Can be `async/await` functions with direct DB/file queries (`await db.query(...)`).\n   - Zero JavaScript shipped to the browser for those components, shrinking bundle sizes.\n   - Cannot use React state hooks (`useState`, `useEffect`) or browser event handlers (`onClick`).\n2. **Client Components (`"use client"`)**:\n   - Opt-in directive placed at the top of the file.\n   - Required for user interactivity, form state, browser APIs (`window`, `localStorage`), and animations.\n   - Pre-rendered to HTML on server for SEO (SSR) and then **hydrated** in the browser by attaching React event listeners.\n3. **Composition Rule**: Server Components can pass server data down to Client Components as serializable props, or wrap Client Components as children (`children` slot pattern).',
    keyPointsToMention: [
      'RSC: Server-only execution, zero client JS bundle contribution',
      '"use client": Defines the boundary for client-side JavaScript hydration and interactivity',
      'Hydration: Attaching React Fiber event listeners to static SSR HTML',
      'Streaming SSR with Suspense boundaries for progressive rendering'
    ],
    whatInterviewersLookFor: [
      'Clarification that `"use client"` components are still rendered on the server during SSR',
      'Knowledge of passing Server Components as children to Client Components'
    ],
    codeExample: `// 1. React Server Component (app/dashboard/page.tsx) - ZERO Client JS!
import { db } from '@/lib/db';
import { ClientInteractiveChart } from './ClientInteractiveChart';

export default async function DashboardPage() {
  // Direct server DB query with no API route needed
  const salesData = await db.sales.findMany();

  return (
    <main>
      <h1>Enterprise Sales Overview</h1>
      {/* Passing server data to an interactive Client Component */}
      <ClientInteractiveChart initialData={salesData} />
    </main>
  );
}

// 2. Client Component (app/dashboard/ClientInteractiveChart.tsx)
'use client';

import React, { useState } from 'react';

export function ClientInteractiveChart({ initialData }: { initialData: any[] }) {
  const [filter, setFilter] = useState('all');

  return (
    <div>
      <button onClick={() => setFilter('q1')}>Filter Q1</button>
      {/* Interactive charting logic */}
    </div>
  );
}`,
    tags: ['reactadvanced', 'rsc', 'nextjs', 'server-components', 'client-components', 'ssr', 'hydration']
  },
  {
    id: 'reactadv_03',
    category: 'reactadvanced',
    topic: 'React Performance Optimization & Re-render Elimination',
    difficulty: 'Senior',
    question: 'How do you profile, identify, and eliminate unnecessary re-renders in large React applications? When do `React.memo`, `useCallback`, and `useMemo` actually hurt performance?',
    shortAnswer: 'Use the **React DevTools Profiler** with "Highlight updates when components render" enabled to record render cascades. Fixes: 1) Push state down to leaf components; 2) Lift content up via `children` composition (bypasses parent re-renders); 3) Apply `React.memo` with memoized callback props (`useCallback`). Overusing `useMemo`/`useCallback` everywhere adds dependency comparison overhead and memory allocation without saving renders if child components are unmemoized.',
    seniorPoint: 'Wrapping a function in `useCallback` is useless if the child component receiving the prop is NOT wrapped in `React.memo`. The child will re-render anyway, meaning you paid the memory/allocation cost of `useCallback` for zero benefit.',
    spokenTip: 'Prefer component composition and state localization first; use React.memo and useCallback only when profiling proves measurable render bottlenecks.',
    interviewAnswer: 'Methodology for React Performance Optimization:\n1. **Diagnosis**: Open React DevTools Profiler, enable "Record why each component rendered", and record a user interaction. Identify flame graphs with large green/yellow re-render trees.\n2. **Architectural Optimization (No memoization needed!)**:\n   - **Colocate State**: Move state as close to the leaf components as possible.\n   - **Component Composition with `children`**: If a heavy component wraps a container that manages state, pass the heavy component as `children`. React will not re-render `children` when the wrapper component\'s state updates!\n3. **Targeted Memoization**:\n   - Wrap expensive child components in `React.memo`.\n   - Wrap callbacks passed to memoized children in `useCallback`.\n   - Wrap expensive O(N^2) calculations in `useMemo`.\n4. **When Memoization Hurts**: For cheap calculations (e.g. `items.length > 0`), the cost of initializing and diffing the dependency array on every render is higher than the calculation itself.',
    keyPointsToMention: [
      'React DevTools Profiler flamegraphs',
      'Composition with children pattern to skip re-renders without memo()',
      'The prerequisite relationship between React.memo and useCallback',
      'Overhead of excessive memoization'
    ],
    whatInterviewersLookFor: [
      'Understanding of the "children" composition optimization pattern',
      'Clear explanation of why unmemoized children render regardless of useCallback'
    ],
    codeExample: `// 1. Composition Pattern (Skips ExpensiveTree re-renders with ZERO memoization!)
export function ScrollTrackerWrapper({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);

  // When scrollY updates, ScrollTrackerWrapper re-renders,
  // but 'children' was created outside and is NOT re-rendered!
  return (
    <div onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}>
      <p>Scroll Position: {scrollY}px</p>
      {children}
    </div>
  );
}

// 2. Correct memo + useCallback Pairing:
const MemoizedListItem = React.memo(function ListItem({ 
  item, 
  onDelete 
}: { 
  item: Item; 
  onDelete: (id: string) => void; 
}) {
  return <button onClick={() => onDelete(item.id)}>{item.name}</button>;
});`,
    tags: ['reactadvanced', 'performance', 'react-memo', 'usecallback', 'usememo', 're-renders', 'profiling']
  }
];
