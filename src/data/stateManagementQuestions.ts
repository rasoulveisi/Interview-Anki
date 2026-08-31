import { Question } from '../types';

export const stateManagementQuestions: Question[] = [
  {
    id: 'state_01',
    category: 'statemanagement',
    topic: 'NgRx Global Store & Redux Cycle',
    difficulty: 'Senior',
    question: 'How does the Redux pattern work in NgRx? Walk through Actions, Reducers, Selectors, and Effects with purity guarantees.',
    shortAnswer: 'The NgRx Redux loop enforces unidirectional data flow: 1) UI dispatches an **Action** (plain object describing an event); 2) **Reducers** (pure functions) take the current state and action to return a new immutable state; 3) **Selectors** query and memoize state slices; 4) **Effects** isolate side-effects (HTTP, timers), listen for actions, and dispatch new actions.',
    interviewAnswer: 'NgRx implements the Redux pattern for Angular with strict unidirectional flow:\n1. **Actions**: Plain objects with a unique `type` identifier and optional `props`. They describe *events* that occurred (e.g. `[Auth Page] Login Submitted`), not direct commands.\n2. **Reducers**: Pure, synchronous functions `(state, action) => newState`. They must never mutate state directly or execute side effects; they produce a new state reference using object spread or immutable helpers.\n3. **Selectors**: Pure functions using `createSelector` that extract and compose specific slices of state. They provide automatic memoization—if the underlying input slices haven\'t changed, the selector returns the cached result without recomputing.\n4. **Effects**: RxJS-powered services that listen to the global action stream, perform asynchronous operations (API calls, storage), and dispatch new actions upon completion (e.g. `loginSuccess` or `loginFailure`).',
    spokenTip: 'Unidirectional data flow: Components dispatch Actions, Reducers update State immutably, Selectors memoize queries, and Effects handle side-effects.',
    example: {
      language: 'typescript',
      code: `import { createAction, props, createReducer, on, createSelector, createFeatureSelector } from '@ngrx/store';

// 1. Action
export const loadProductsSuccess = createAction(
  '[Products API] Load Products Success',
  props<{ products: Product[] }>()
);

// 2. Reducer (Pure function)
export interface ProductState {
  items: Product[];
  isLoading: boolean;
}

const initialState: ProductState = { items: [], isLoading: false };

export const productReducer = createReducer(
  initialState,
  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    items: products,
    isLoading: false
  }))
);

// 3. Memoized Selector
export const selectProductState = createFeatureSelector<ProductState>('products');
export const selectActiveProducts = createSelector(
  selectProductState,
  (state) => state.items.filter(p => p.isActive)
);`,
      explanation: 'Shows typed actions, pure immutable reducer updates, and memoized selectors.'
    },
    seniorPoint: 'Why immutability matters in NgRx: When reducers return new state references, `OnPush` components and memoized selectors instantly detect changes via shallow reference equality (`prev !== curr`), preventing expensive deep object tree traversals.',
    followUps: [
      {
        question: 'Why should Actions be named as "Events" rather than "Commands"?',
        answer: 'Event-driven naming (e.g. `[Order Page] Submit Clicked`) allows multiple independent reducers and effects to react to a single event, decoupling the UI from backend implementation details.'
      },
      {
        question: 'How do you test an NgRx Reducer compared to an NgRx Effect?',
        answer: 'Reducers are pure functions tested synchronously with simple input/output assertions. Effects involve asynchronous RxJS streams and are tested using marble testing or `jasmine-marbles` / `TestScheduler`.'
      }
    ],
    keyPointsToMention: [
      'Unidirectional data flow: Actions -> Reducers -> Store -> Selectors -> Components',
      'Reducers must be 100% pure and synchronous',
      'Selectors provide automatic memoization and fine-grained view subscriptions',
      'Effects isolate asynchronous I/O and API calls'
    ],
    tags: ['ngrx', 'statemanagement', 'redux', 'actions', 'reducers', 'selectors', 'effects']
  },
  {
    id: 'state_02',
    category: 'statemanagement',
    topic: 'State Architecture Landscape',
    difficulty: 'Senior',
    question: 'How do you choose between Signals in Services, NgRx SignalStore, and NgRx Global Store for enterprise Angular architectures?',
    shortAnswer: 'Use **Signals in Services** for simple component trees and localized widget state. Use **NgRx SignalStore** for modular, feature-level state requiring structured methods, computed slices, and custom plugins with minimal boilerplate. Use **NgRx Global Store** for massive enterprise apps needing cross-feature event correlation, strict time-travel debugging, and audit logging.',
    interviewAnswer: 'When architecting state in modern Angular, I match the tool to the complexity layer:\n1. **Component / Local State (Signals in Services)**: For simple features, private writable `signal()` properties inside a scoped `@Injectable()` service paired with `computed()` derived getters provide clean reactivity with zero boilerplate.\n2. **Feature / Module State (NgRx SignalStore)**: The modern sweet spot. `signalStore()` provides declarative state slices, custom `withMethods`, `withComputed`, and `withEntities`, offering type-safe structured state without the ceremony of actions/reducers.\n3. **Global Enterprise State (NgRx Global Store)**: For complex apps where 5+ distinct features react to a single event (e.g. user logout, multi-step checkout), global NgRx with Redux DevTools time-travel debugging, strict serializability, and meta-reducers is the gold standard.',
    spokenTip: 'I use Signals in Services for local state, NgRx SignalStore for feature-level modular state, and NgRx Global Store when cross-domain event coordination is required.',
    example: {
      language: 'typescript',
      code: `// Modern Feature State with NgRx SignalStore
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ProductService } from './product.service';

export interface CatalogState {
  products: Product[];
  filterQuery: string;
  loading: boolean;
}

export const CatalogStore = signalStore(
  { providedIn: 'root' },
  withState<CatalogState>({ products: [], filterQuery: '', loading: false }),
  withComputed(({ products, filterQuery }) => ({
    filteredProducts: computed(() => 
      products().filter(p => p.name.toLowerCase().includes(filterQuery().toLowerCase()))
    ),
    productCount: computed(() => products().length)
  })),
  withMethods((store, productService = inject(ProductService)) => ({
    setFilter(query: string) {
      patchState(store, { filterQuery: query });
    },
    async loadAll() {
      patchState(store, { loading: true });
      const items = await productService.fetchAll();
      patchState(store, { products: items, loading: false });
    }
  }))
);`,
      explanation: 'Shows modern NgRx SignalStore with state slices, computed signals, and methods.'
    },
    seniorPoint: 'Avoid "State Bloat": Not all data belongs in global state. Transient form values, modal open/close states, and simple accordion toggles should remain local component signals.',
    followUps: [
      {
        question: 'What is the performance difference between NgRx SignalStore and classic NgRx Store?',
        answer: 'NgRx SignalStore updates fine-grained Signals directly at the component level without traversing the entire global selector tree, resulting in lower memory allocations and faster localized renders.'
      },
      {
        question: 'How do you handle pagination and entity collections in NgRx SignalStore?',
        answer: 'Using the `withEntities<Product>()` plugin, which provides built-in entity management helpers (`addEntity`, `setAllEntities`, `removeEntity`) similar to `@ngrx/entity`.'
      }
    ],
    keyPointsToMention: [
      'Three tiers: Signals in Services (local), SignalStore (feature/domain), Global NgRx (enterprise cross-cutting)',
      'SignalStore provides declarative, plugin-based, type-safe state with zero boilerplate',
      'Distinction between server state, global client state, and transient local component state'
    ],
    tags: ['angular', 'statemanagement', 'signals', 'signalstore', 'ngrx', 'architecture']
  },
  {
    id: 'state_03',
    category: 'statemanagement',
    topic: 'State Normalization & @ngrx/entity',
    difficulty: 'Senior',
    question: 'What is State Normalization, why is it critical for frontend performance, and how does @ngrx/entity achieve O(1) lookups?',
    shortAnswer: 'State Normalization flattens nested relational data into dictionary maps indexed by ID (`{ ids: string[], entities: Record<string, T> }`). This eliminates data duplication, simplifies updates, and provides $O(1)$ constant-time lookup and mutation performance via `@ngrx/entity`.',
    interviewAnswer: 'In complex applications, storing nested API responses (e.g. an Author containing an array of Books, which each contain an array of Comments) leads to data duplication and synchronization bugs: updating a book title in one view leaves stale titles in other views.\n\n**State Normalization** follows relational database principles:\n1. Each entity type has its own isolated table/slice in the store.\n2. Relationships are stored as arrays of IDs (e.g. `author.bookIds: [1, 2]`).\n3. `@ngrx/entity` standardizes this using `EntityState<T>` with `{ ids: [], entities: {} }`.\n4. Looking up or updating an entity by ID is $O(1)$ (`entities[id]`) instead of an $O(N)$ array scan (`items.find(x => x.id === id)`).\n5. Adapter helpers (`setAll`, `updateOne`, `removeOne`, `upsertMany`) automatically manage dictionary maps and order arrays.',
    spokenTip: 'Normalizing state transforms nested data into flat ID-to-entity dictionaries, eliminating data duplication and enabling O(1) mutations.',
    example: {
      language: 'typescript',
      code: `import { createEntityAdapter, EntityState, EntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

export interface User {
  id: string;
  name: string;
  email: string;
}

// 1. Create Entity Adapter
export const userAdapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user: User) => user.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

// 2. Entity State: { ids: string[], entities: { [id: string]: User } }
export interface UserState extends EntityState<User> {
  selectedUserId: string | null;
}

export const initialUserState: UserState = userAdapter.getInitialState({
  selectedUserId: null
});

// 3. O(1) Immutable Updates via Adapter
export const userReducer = createReducer(
  initialUserState,
  on(UserActions.userUpdated, (state, { user }) => 
    userAdapter.updateOne({ id: user.id, changes: user }, state) // O(1) Dictionary update!
  ),
  on(UserActions.usersLoaded, (state, { users }) => 
    userAdapter.setAll(users, state)
  )
);`,
      explanation: 'Demonstrates @ngrx/entity adapter setup, EntityState structure, and O(1) updateOne operations.'
    },
    seniorPoint: 'Denormalization (reconstructing nested view models for UI display) should happen exclusively in memoized Selectors. This keeps raw state flat while giving components rich derived data.',
    followUps: [
      {
        question: 'How do you handle compound primary keys in `@ngrx/entity`?',
        answer: 'Provide a custom `selectId` function to the adapter: `selectId: (item) => `${item.tenantId}_${item.id}``.'
      },
      {
        question: 'What is the performance advantage of `updateOne` over array `.map()` in reducers?',
        answer: 'Array `.map()` is $O(N)$ and creates a new array instance iterating over every single element. An entity dictionary update is $O(1)$ and only clones the modified entity entry.'
      }
    ],
    keyPointsToMention: [
      'Normalized schema: ids array + entities dictionary',
      'Eliminates duplicate entities across different views',
      'O(1) lookups and updates vs O(N) array scans',
      'Denormalization occurs reactively inside memoized Selectors'
    ],
    tags: ['ngrx', 'entity', 'normalization', 'statemanagement', 'performance', 'data-structures']
  },
  {
    id: 'state_04',
    category: 'statemanagement',
    topic: 'Zustand vs Redux Toolkit vs Signals',
    difficulty: 'Senior',
    question: 'Compare Zustand, Redux Toolkit, and Signals for client-side state management. Why has Zustand become the industry standard in React?',
    shortAnswer: 'Zustand is a minimalist (<1KB), hook-based state library that requires zero Context Providers, supports fine-grained selector subscriptions (only re-renders when the selected property changes), and allows state access outside React components. Redux Toolkit has heavier action/reducer ceremony and larger bundle footprint. Signals provide automatic dependency tracking without explicit selector hooks.',
    interviewAnswer: 'In modern state architecture:\n1. **Redux Toolkit (RTK)**: Solved classic Redux boilerplate using `createSlice` and Immer. However, it still requires wrapping the app in `<Provider store={store}>`, writing actions, and maintaining serializable state rules. It is best for massive enterprise teams requiring strict architectural guardrails.\n2. **Zustand**: Created a massive paradigm shift in React. You create a store with `create((set, get) => ({ ... }))`. Components subscribe via selectors `useStore(state => state.activeId)`. It has **no Context provider wrapper**, eliminates 80% of boilerplate, has tiny bundle overhead (<1KB), and supports async actions natively.\n3. **Signals (Angular / Preact / Solid)**: Eliminates selector subscriptions altogether. Reading `count()` dynamically subscribes the view to that specific signal at runtime with zero manual selector maintenance.',
    spokenTip: 'Zustand won in React because it gives selector-based subscriptions and clean async actions with zero provider wrappers and under 1KB bundle size.',
    example: {
      language: 'typescript',
      code: `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  totalCount: () => number;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        addItem: (item) => set(state => ({ items: [...state.items, item] })),
        removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
        clear: () => set({ items: [] }),
        totalCount: () => get().items.length
      }),
      { name: 'cart-storage' } // Automatic LocalStorage persistence!
    )
  )
);

// Usage in Component: Only re-renders when itemCount changes!
export function CartBadge() {
  const itemCount = useCartStore(state => state.items.length);
  return <div className="badge">{itemCount}</div>;
}`,
      explanation: 'Shows Zustand store with devtools and persist middleware, and fine-grained selector subscription.'
    },
    seniorPoint: 'Zustand allows reading and mutating state outside of React component lifecycles via `useCartStore.getState()` and `useCartStore.setState()`. This enables clean integration inside API interceptors, Web Workers, and non-React utility files.',
    followUps: [
      {
        question: 'How do you prevent re-renders when selecting multiple properties from a Zustand store?',
        answer: 'Use `useShallow` from `zustand/react/shallow`: `const { name, role } = useCartStore(useShallow(state => ({ name: state.name, role: state.role })))`.'
      },
      {
        question: 'Why doesn\'t Zustand suffer from the Context re-render performance bug?',
        answer: 'Because Zustand uses an external event-emitter subscriber pattern (via React\'s `useSyncExternalStore`) rather than React Context, notifying only the specific component instances whose selector return values have changed.'
      }
    ],
    keyPointsToMention: [
      'Zustand: Hook-based, zero Context Provider required, <1KB bundle',
      'useSyncExternalStore under the hood for selective subscriber re-renders',
      'Accessing state outside React via getState() / setState() (useful in HTTP interceptors)',
      'Comparison with RTK slices and Angular Signals'
    ],
    tags: ['statemanagement', 'zustand', 'redux-toolkit', 'signals', 'react', 'performance']
  },
  {
    id: 'state_05',
    category: 'statemanagement',
    topic: 'Derived State & Single Source of Truth',
    difficulty: 'Senior',
    question: 'What is Derived State, and why is duplicating derived calculations into writable state (e.g. syncing props to state in useEffect) a critical anti-pattern?',
    shortAnswer: 'Derived State is any value that can be computed synchronously from existing state or props (e.g. `fullName = firstName + " " + lastName` or `filteredItems = items.filter(...)`). Duplicating derived values into a separate `useState` or `signal` creates synchronization bugs, stale data, and redundant re-renders. Always compute derived state dynamically or memoize it via `computed()` / `useMemo()`.',
    interviewAnswer: 'A very common anti-pattern in frontend codebases is storing computed values in writable state and writing `useEffect` or `ngOnChanges` to keep them synchronized:\n\n1. **The Bug**: If you have `items` state and `filteredItems` state, updating `items` requires remembering to update `filteredItems`. If an async response arrives, or a filter dropdown changes, state easily goes out of sync, displaying stale or conflicting information.\n2. **Single Source of Truth**: Keep only the raw, foundational data in state (the `items` array and the `filterQuery` string). Calculate `filteredItems` on the fly during render or via a memoized derivation.\n3. **Modern Derivation Tools**:\n   - *Angular*: `filteredItems = computed(() => this.items().filter(...))`.\n   - *React*: `const filteredItems = useMemo(() => items.filter(...), [items, query])`.\n   - *NgRx*: Memoized Selectors (`createSelector`).',
    spokenTip: 'Never store in state what can be calculated from existing state; use computed() or useMemo() to maintain a single source of truth.',
    example: {
      language: 'typescript',
      code: `// ❌ BAD ANTI-PATTERN: Redundant state synced via effect
function BadComponent({ users, query }: Props) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    // ⚠️ Extra re-render and risk of stale sync!
    setFilteredUsers(users.filter(u => u.name.includes(query)));
  }, [users, query]);

  return <List items={filteredUsers} />;
}

// ✅ CLEAN SENIOR PATTERN: Pure Derived State (Single Source of Truth)
function GoodComponent({ users, query }: Props) {
  // Pure derivation during render (or memoized if array is huge)
  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
  }, [users, query]);

  return <List items={filteredUsers} />;
}`,
      explanation: 'Contrasts anti-pattern state synchronization via useEffect with pure derived state derivation.'
    },
    seniorPoint: 'In Angular Signals, `computed()` signals are **lazily evaluated and memoized**. If no template or effect reads the computed signal, it is never calculated. If its dependencies haven\'t changed, it returns the cached value in $O(1)$ time.',
    followUps: [
      {
        question: 'When is it acceptable to copy a prop into local state?',
        answer: 'Only when the prop represents an *initial seed value* for an editable form draft, where local changes are intentionally disconnected from parent prop updates (e.g. `initialDraft`).'
      },
      {
        question: 'What is the "Glitch-Free" guarantee in reactive computation graphs?',
        answer: 'It guarantees that when foundational state changes, derived signals update in topological order so that intermediate expressions never evaluate with mismatched or stale sibling state.'
      }
    ],
    keyPointsToMention: [
      'Single Source of Truth principle',
      'Anti-pattern: syncing props or computed values to state via useEffect / ngOnChanges',
      'Lazy memoization via computed() in Angular and useMemo in React',
      'Glitch-free execution in modern reactive graphs'
    ],
    tags: ['statemanagement', 'derived-state', 'computed', 'single-source-of-truth', 'architecture', 'anti-patterns']
  }
];
