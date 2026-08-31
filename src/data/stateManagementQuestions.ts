import { Question } from '../types';

export const stateManagementQuestions: Question[] = [
  {
    id: 'state_01',
    category: 'statemanagement',
    topic: 'NgRx Architecture & Mental Model',
    difficulty: 'Senior',
    question: 'Explain the core NgRx Redux loop: Actions, Reducers, Selectors, and Effects. Why must Reducers be pure functions while Effects handle side effects?',
    shortAnswer: 'Actions express unique events with a type and payload; Reducers are pure, synchronous functions that calculate `(state, action) => newState` via immutability; Selectors extract and memoize slices of state; Effects listen for actions, execute asynchronous side effects (HTTP, WebSockets), and dispatch new actions. Reducers must be pure to guarantee deterministic time-travel debugging and predictable state transitions.',
    seniorPoint: 'NgRx selectors use memoization (`createSelector`). If the input slice reference has not changed, the selector returns the cached calculation result immediately without re-executing the projection function, preventing UI re-rendering overhead.',
    spokenTip: 'Actions describe what happened; Reducers compute the new state synchronously; Effects handle asynchronous operations; Selectors query state efficiently.',
    interviewAnswer: 'NgRx enforces a unidirectional data flow:\n1. **Actions**: Declarative descriptions of unique events (e.g. `[Auth Page] Login Submitted`).\n2. **Reducers**: Pure functions that take the current state and an action, returning a new immutable state object. Because they are pure, they have zero side effects and can be tested without mocks.\n3. **Effects**: RxJS-powered event listeners that capture actions, perform async work (such as HTTP calls or router navigation), and dispatch a success or failure action.\n4. **Selectors**: Composable, memoized queries for reading slices of state from the store.\n\nSeparating synchronous state mutations (Reducers) from async side-effects (Effects) eliminates race conditions and ensures complete reproducibility.',
    keyPointsToMention: [
      'Unidirectional data flow and single source of truth',
      'Purity in Reducers: zero side effects, no Date.now(), Math.random(), or HTTP calls',
      'Memoization in Selectors via createSelector',
      'Effects for isolation of async API calls and orchestration'
    ],
    whatInterviewersLookFor: [
      'Understanding of memoization mechanics in Selectors',
      'Awareness of Good Action Hygiene (describing events, not commands)'
    ],
    codeExample: `// 1. Actions (Good Action Hygiene)
export const AuthActions = createActionGroup({
  source: 'Auth API',
  events: {
    'Login Success': props<{ user: User; token: string }>(),
    'Login Failure': props<{ error: string }>()
  }
});

// 2. Pure Reducer
export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isLoading: false,
    error: null
  }))
);

// 3. Memoized Selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);
export const selectIsAdmin = createSelector(
  selectCurrentUser,
  (user) => user?.roles.includes('ADMIN') ?? false
);`,
    tags: ['statemanagement', 'ngrx', 'redux', 'actions', 'reducers', 'selectors', 'effects']
  },
  {
    id: 'state_02',
    category: 'statemanagement',
    topic: 'State Architecture: Signals vs NgRx vs Services',
    difficulty: 'Senior',
    question: 'When is a full NgRx Global Store overkill, and how do you choose between Signals, Services with Subjects, NgRx SignalStore, and NgRx Global Store?',
    shortAnswer: 'Use Local Signals for component-only UI state; use Services with Signals/RxJS for feature-level shared state with moderate complexity; use `@ngrx/signals` (SignalStore) for lightweight, modular, reactive state with entity management; use the Global NgRx Store when managing massive multi-team enterprise apps with complex cross-feature synchronization, web socket streaming, caching, and strict audit/replay requirements.',
    seniorPoint: '90% of frontend state is actually Server Cache (remote entity state) or Transient UI state. Over-engineering with boilerplate global actions for simple local CRUD slows development without architectural payoff.',
    spokenTip: 'Default to simple Services with Signals or NgRx SignalStore; reserve full NgRx Store for complex, high-concurrency enterprise domains.',
    interviewAnswer: 'State should live as close to where it is used as possible:\n1. **Local Component State**: Writable Signals (`signal()`). No service needed for toggle buttons or local modal state.\n2. **Feature/Shared State**: Injectable Service with Signals or `@ngrx/signals` `signalStore`. Perfect for managing a shopping cart or multi-step checkout.\n3. **NgRx SignalStore**: The modern sweet spot—combines signals reactivity, computed properties, entity adapters (`withEntities`), and async methods (`withMethods`) in a type-safe, lightweight, boilerplate-free package.\n4. **NgRx Global Store**: For large-scale distributed applications requiring time-travel debugging, complex action-driven cross-module coordination, offline sync, or shared state accessed across 10+ independent lazy-loaded features.',
    keyPointsToMention: [
      'State categorization: Local UI, Feature Shared, Global Domain, Server Cache',
      'NgRx SignalStore as the modern Angular 17+ state solution',
      'Cost-benefit analysis of Redux boilerplate vs developer velocity'
    ],
    whatInterviewersLookFor: [
      'Pragmatic architectural decision-making rather than blindly prescribing Redux everywhere',
      'Knowledge of modern NgRx SignalStore'
    ],
    codeExample: `import { signalStore, withState, withComputed, withMethods, withHooks } from '@ngrx/signals';
import { withEntities, addEntity, removeEntity } from '@ngrx/signals/entities';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withEntities<Todo>(),
  withState({ isLoading: false, filter: 'all' as 'all' | 'active' | 'completed' }),
  withComputed(({ entities, filter }) => ({
    filteredTodos: computed(() => {
      const currentFilter = filter();
      const list = entities();
      if (currentFilter === 'active') return list.filter(t => !t.completed);
      if (currentFilter === 'completed') return list.filter(t => t.completed);
      return list;
    })
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    loadTodos: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => http.get<Todo[]>('/api/todos')),
        tap((todos) => {
          patchState(store, setAllEntities(todos), { isLoading: false });
        })
      )
    )
  }))
);`,
    tags: ['statemanagement', 'signals', 'signal-store', 'ngrx', 'state-architecture']
  },
  {
    id: 'state_03',
    category: 'statemanagement',
    topic: 'State Normalization & Entity Adapters',
    difficulty: 'Senior',
    question: 'Why is State Normalization critical in complex frontend apps, and how does `@ngrx/entity` implement dictionary-based state?',
    shortAnswer: 'State normalization avoids nested, duplicated data by storing entities in a flattened structure: a dictionary of `{ [id: string]: Entity }` (entities) and an ordered array of `ids: string[]`. This converts O(N) item lookups/updates into O(1) operations, eliminates inconsistencies when an item is updated in multiple places, and minimizes re-render cascades.',
    seniorPoint: 'Nested arrays in state force developers to write deep immutable spreading (`state.authors.map(a => a.books.map(...))`), which is error-prone, garbage-collector heavy, and breaks selector memoization.',
    spokenTip: 'Treat your frontend state like a relational database: flat tables keyed by ID with foreign key references rather than deeply nested trees.',
    interviewAnswer: 'In complex applications, storing collections as arrays leads to problems:\n1. Updating a single item requires an `array.map()` scanning all items (O(N)).\n2. If the same entity appears in multiple lists (e.g. "Recent Posts" and "Author Posts"), updating it in one list leaves the other stale.\n\nNormalization structures state into:\n- `ids: string[]` (maintains ordering and pagination)\n- `entities: Record<string, T>` (hash map for instant O(1) access)\n\n`@ngrx/entity` provides prebuilt adapter methods (`addOne`, `updateOne`, `upsertMany`, `removeOne`) that perform immutable mutations efficiently and automatically generate memoized selectors (`selectAll`, `selectEntities`, `selectIds`, `selectTotal`).',
    keyPointsToMention: [
      'O(1) lookups vs O(N) array scans',
      'Elimination of stale data anomalies when entities are shared across views',
      '@ngrx/entity createEntityAdapter and adapter.getSelectors()',
      'Selectors for mapping IDs back to denormalized view models for UI presentation'
    ],
    whatInterviewersLookFor: [
      'Clear explanation of the dictionary + ID array pattern',
      'Understanding of memory immutability and GC benefits'
    ],
    codeExample: `import { createEntityAdapter, EntityState, EntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

export interface Product {
  id: string;
  name: string;
  price: number;
}

// 1. Normalized State Interface
export interface ProductState extends EntityState<Product> {
  selectedProductId: string | null;
  isLoading: boolean;
}

// 2. Entity Adapter
export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  selectId: (product: Product) => product.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

export const initialProductState: ProductState = productAdapter.getInitialState({
  selectedProductId: null,
  isLoading: false
});

// 3. Adapter operations are O(1) and immutable
export const productReducer = createReducer(
  initialProductState,
  on(ProductActions.productUpdated, (state, { update }) => 
    productAdapter.updateOne(update, state)
  ),
  on(ProductActions.productsLoaded, (state, { products }) => 
    productAdapter.setAll(products, { ...state, isLoading: false })
  )
);`,
    tags: ['statemanagement', 'normalization', 'entity-adapter', 'ngrx-entity', 'performance']
  }
];
