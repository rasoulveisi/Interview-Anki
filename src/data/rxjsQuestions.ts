import { Question } from '../types';

export const rxjsQuestions: Question[] = [
  {
    id: 'rxjs_01',
    category: 'rxjs',
    topic: 'Higher-Order Mapping Operators',
    difficulty: 'Senior',
    question: 'How do switchMap, mergeMap, concatMap, and exhaustMap differ in flattening inner Observables? When is each used?',
    shortAnswer: '`switchMap` cancels the active inner observable when a new value arrives (best for search autocomplete). `mergeMap` runs all inner observables in parallel without order guarantees (best for concurrent independent saves). `concatMap` queues inner observables sequentially in exact arrival order (best for sequential writes). `exhaustMap` drops all incoming emissions while an inner observable is active (best for login and payment buttons).',
    interviewAnswer: 'Higher-order mapping operators transform outer emissions into inner Observables and flatten them back into a single stream:\n- **`switchMap`**: Switches to the newest inner Observable, immediately unsubscribing from and cancelling the previous in-flight one. Ideal for search inputs where older search queries become irrelevant.\n- **`mergeMap`**: Runs inner Observables concurrently as they arrive. Order of completion is not guaranteed. Ideal for non-blocking parallel fetches or independent item saves.\n- **`concatMap`**: Subscribes to inner Observables one by one in sequence, waiting for the previous one to complete before starting the next. Ideal for transactions where order matters (like replay logs or queue processing).\n- **`exhaustMap`**: Ignores and drops all new outer emissions until the current inner Observable completes. Ideal for preventing double-submissions on login or payment buttons.',
    spokenTip: 'I use switchMap for search cancellation, mergeMap for parallel fetches, concatMap for strict sequential queuing, and exhaustMap to prevent double button clicks.',
    example: {
      language: 'typescript',
      code: `import { fromEvent, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, exhaustMap, concatMap } from 'rxjs/operators';

// 1. switchMap: Cancels previous in-flight search request
const searchInput = document.getElementById('search-box')!;
fromEvent(searchInput, 'input').pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(e => fetchSearchResults((e.target as HTMLInputElement).value))
).subscribe(results => renderUI(results));

// 2. exhaustMap: Drops repeated clicks while payment is in progress
const payButton = document.getElementById('pay-btn')!;
fromEvent(payButton, 'click').pipe(
  exhaustMap(() => processPaymentApi())
).subscribe(receipt => showConfirmation(receipt));

// 3. concatMap: Guarantees strict sequential database saves
const saveQueue$ = of(item1, item2, item3).pipe(
  concatMap(item => saveItemToBackend(item))
);`,
      explanation: 'Demonstrates practical use cases: search cancellation, payment double-click prevention, and sequential queueing.'
    },
    seniorPoint: 'Unsubscribing via `switchMap` actually aborts the underlying browser HTTP request when using Angular `HttpClient` or `fetch` with `AbortController`, saving network bandwidth and backend processing.',
    followUps: [
      {
        question: 'What happens if an error occurs inside a `switchMap` inner observable?',
        answer: 'If unhandled, the error bubbles up and terminates the entire outer stream permanently. To prevent this, always place `catchError` inside the inner observable pipeline.'
      },
      {
        question: 'How can you limit the concurrency of `mergeMap`?',
        answer: '`mergeMap` accepts a second optional parameter: `mergeMap(fn, concurrentLimit)` (e.g. `mergeMap(fn, 3)` processes a maximum of 3 active requests in parallel).'
      }
    ],
    keyPointsToMention: [
      'switchMap cancels prior inner streams (search / autocomplete)',
      'mergeMap executes in parallel without cancellation or queuing',
      'concatMap buffers and executes in strict arrival order (queues)',
      'exhaustMap ignores subsequent triggers until the current inner stream completes (buttons)',
      'Inner catchError placement is mandatory to prevent outer stream termination'
    ],
    tags: ['rxjs', 'operators', 'switchMap', 'mergeMap', 'concatMap', 'exhaustMap', 'reactivity']
  },
  {
    id: 'rxjs_02',
    category: 'rxjs',
    topic: 'Subjects & Multicasting',
    difficulty: 'Senior',
    question: 'Compare Subject, BehaviorSubject, ReplaySubject, and AsyncSubject. What is the role of shareReplay({ bufferSize: 1, refCount: true })?',
    shortAnswer: '`Subject` has no initial value and only emits future events. `BehaviorSubject` requires an initial value and emits the current value immediately to new subscribers. `ReplaySubject` buffers N past emissions. `AsyncSubject` emits only the final value upon completion. `shareReplay({ bufferSize: 1, refCount: true })` turns a cold HTTP observable into a warm cached stream and cleans up when all subscribers unsubscribe.',
    interviewAnswer: 'Subjects act as both an Observable and an Observer (allowing `.next()` calls to push data):\n1. **`Subject`**: Multicasts to active subscribers only. Late subscribers receive nothing that was emitted before they subscribed.\n2. **`BehaviorSubject`**: Holds a current state value accessible synchronously via `.getValue()`. New subscribers immediately receive the latest value upon subscribing.\n3. **`ReplaySubject(N)`**: Buffers the last N emitted values (or values within a time window) and replays all of them to new subscribers.\n4. **`AsyncSubject`**: Emits only the last emitted value, and only when `.complete()` is called.\n\n`shareReplay({ bufferSize: 1, refCount: true })` is crucial for caching HTTP requests. It shares a single HTTP call across multiple components. The `refCount: true` configuration ensures that when all components unmount and subscriptions drop to zero, the internal subscription is unsubscribed, preventing memory leaks.',
    spokenTip: 'Use BehaviorSubject when you need an initial current value, and shareReplay({ bufferSize: 1, refCount: true }) to cache HTTP calls safely.',
    example: {
      language: 'typescript',
      code: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);

  // Cached Observable: Fires HTTP GET only once across all subscribers
  readonly config$: Observable<AppConfig> = this.http.get<AppConfig>('/api/config').pipe(
    // CRITICAL: refCount: true prevents memory leak when subscribers unsubscribe!
    shareReplay({ bufferSize: 1, refCount: true })
  );
}`,
      explanation: 'Uses shareReplay with bufferSize 1 and refCount true to cache API data without leaking memory.'
    },
    seniorPoint: 'Using `shareReplay(1)` without `refCount: true` keeps the source observable alive indefinitely even when all components unsubscribe. In Angular, this can prevent destroyed components and services from being garbage collected.',
    followUps: [
      {
        question: 'Why should you avoid exposing raw `BehaviorSubject` instances publicly from services?',
        answer: 'Exposing a raw `BehaviorSubject` allows any component to call `.next()` and mutate state unpredictably. Instead, keep the subject `private` and expose it publicly as a read-only `asObservable()` or Signal.'
      },
      {
        question: 'When would you use `ReplaySubject` instead of `BehaviorSubject`?',
        answer: 'When you need to replay multiple historical values (e.g. the last 5 chat messages) or when you do not have a sensible default initial value at instantiation time.'
      }
    ],
    keyPointsToMention: [
      'Subject (no buffer) vs BehaviorSubject (1 current value + initial) vs ReplaySubject (N buffered values)',
      'AsyncSubject emits only on completion',
      'shareReplay({ bufferSize: 1, refCount: true }) converts cold observables into shared cached streams with safe teardown'
    ],
    tags: ['rxjs', 'subjects', 'behaviorsubject', 'replaysubject', 'shareReplay', 'multicasting']
  },
  {
    id: 'rxjs_03',
    category: 'rxjs',
    topic: 'Subscription Teardown & Leaks',
    difficulty: 'Senior',
    question: 'How do you prevent memory leaks in RxJS subscriptions? Contrast takeUntilDestroyed, toSignal(), async pipe, and manual unsubscribes.',
    shortAnswer: 'Uncleaned subscriptions keep component instances in memory. Modern best practices are: 1) The template `async` pipe (auto-subscribes and auto-unsubscribes); 2) `toSignal()` (converts observable to signal and handles cleanup); 3) `takeUntilDestroyed(destroyRef)` (unsubscribes automatically on component destruction). Manual subscription arrays are legacy and error-prone.',
    interviewAnswer: 'When a component subscribes to an infinite Observable (like a global service stream, timer, or router events), the closure retains the component reference. When the user navigates away, Angular destroys the DOM node, but the component instance remains in RAM—causing a memory leak.\n\nModern strategies to manage subscriptions in order of preference:\n1. **Template `async` Pipe / Control Flow**: Automatically manages subscription and unsubscription on view teardown.\n2. **`toSignal(obs$)`**: Modern Angular API that converts an Observable to a Signal and automatically cleans up the subscription when the injection context is destroyed.\n3. **`takeUntilDestroyed(this.destroyRef)`**: The modern operator that completes the stream automatically when the component is destroyed.\n4. **Manual `Subscription.unsubscribe()` in `ngOnDestroy`**: Legacy fallback, verbose and prone to developer oversight.',
    spokenTip: 'Prefer toSignal() and the async pipe for declarative cleanup, or takeUntilDestroyed() when manual subscriptions are necessary.',
    example: {
      language: 'typescript',
      code: `import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DataService } from './data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: \`
    <!-- 1. Signal Binding (Zero manual subscriptions!) -->
    <div>Active Users: {{ activeUsers() }}</div>
    
    <!-- 2. Async Pipe Binding -->
    @if (metrics$ | async; as metrics) {
      <p>CPU: {{ metrics.cpu }}%</p>
    }
  \`
})
export class DashboardComponent {
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);

  // Modern Approach 1: Convert to Signal with automatic teardown
  activeUsers = toSignal(this.dataService.activeUsers$, { initialValue: 0 });

  // Modern Approach 2: Async pipe observable
  metrics$ = this.dataService.getLiveMetrics();

  constructor() {
    // Modern Approach 3: takeUntilDestroyed inside injection context
    this.dataService.notifications$.pipe(
      takeUntilDestroyed() // Automatically infers current injection DestroyRef
    ).subscribe(notification => {
      console.log('New alert:', notification);
    });
  }
}`,
      explanation: 'Demonstrates toSignal, async pipe, and takeUntilDestroyed() automatic teardown.'
    },
    seniorPoint: 'If `takeUntilDestroyed()` is called outside the constructor (e.g. inside `ngOnInit`), you must pass the injected `DestroyRef` explicitly: `takeUntilDestroyed(this.destroyRef)`.',
    followUps: [
      {
        question: 'Do you need to unsubscribe from Angular HttpClient requests?',
        answer: 'HttpClient observables emit once and complete immediately, which triggers cleanup. However, unsubscribing before completion is still useful to cancel in-flight network requests if the user navigates away.'
      },
      {
        question: 'What is the risk of placing operators after `takeUntilDestroyed()` in an RxJS pipe?',
        answer: '`takeUntilDestroyed()` should be placed near or at the very end of the pipe. Operators placed after it might not receive the complete notification properly or might introduce side effects.'
      }
    ],
    keyPointsToMention: [
      'Mechanism of memory leaks: long-lived observable retaining component closure references',
      'Hierarchy of modern solutions: toSignal() > async pipe > takeUntilDestroyed() > manual ngOnDestroy',
      'takeUntilDestroyed() constructor injection context vs explicit DestroyRef passing'
    ],
    tags: ['rxjs', 'subscriptions', 'takeUntilDestroyed', 'toSignal', 'memory-leaks', 'async-pipe']
  },
  {
    id: 'rxjs_04',
    category: 'rxjs',
    topic: 'Combination Operators',
    difficulty: 'Senior',
    question: 'Contrast combineLatest, forkJoin, withLatestFrom, merge, and zip. Provide a real-world scenario for each.',
    shortAnswer: '`combineLatest` emits when ANY source emits (after all have emitted at least once). `forkJoin` emits once with the final values when ALL sources complete. `withLatestFrom` samples the latest value from secondary streams only when the primary stream emits. `merge` interleaves emissions from all streams concurrently. `zip` pairs emissions by index (1st with 1st, 2nd with 2nd).',
    interviewAnswer: 'RxJS combination operators handle multi-stream synchronization:\n- **`combineLatest([a$, b$])`**: Waits for all streams to emit at least once, then emits a combined array whenever *any* source emits a new value. Ideal for dynamic filters (combining `searchTerm$`, `category$`, and `pagination$`).\n- **`forkJoin([a$, b$])`**: The RxJS equivalent of `Promise.all`. Waits for all sources to *complete* and emits their final values. Ideal for loading multiple independent HTTP endpoints on page initialization.\n- **`primary$.pipe(withLatestFrom(secondary$))`**: Emits only when the *primary* stream emits, taking the latest value of the secondary stream without letting the secondary stream trigger emissions. Ideal for form submission where you want to read current auth state on button click.\n- **`merge(a$, b$)`**: Flattens multiple streams into one, emitting values in real-time as they arrive. Ideal for combining multiple UI click events.\n- **`zip(a$, b$)`**: Pairs values strictly by emission index (1st with 1st, 2nd with 2nd). Ideal for lock-step step-by-step state matching.',
    spokenTip: 'Use combineLatest for reactive filters, forkJoin for parallel HTTP completion, withLatestFrom for read-only state sampling, and merge for combined event streams.',
    example: {
      language: 'typescript',
      code: `import { combineLatest, forkJoin, fromEvent } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

// 1. combineLatest: Reactive multi-criteria filter
const filteredProducts$ = combineLatest([
  this.searchTermControl.valueChanges,
  this.selectedCategory$,
  this.priceRange$
]).pipe(
  map(([term, category, price]) => filterProducts(term, category, price))
);

// 2. forkJoin: Parallel HTTP calls on page init
forkJoin({
  user: this.http.get<User>('/api/me'),
  permissions: this.http.get<string[]>('/api/permissions'),
  preferences: this.http.get<Preferences>('/api/preferences')
}).subscribe(({ user, permissions, preferences }) => {
  initializeUserProfile(user, permissions, preferences);
});

// 3. withLatestFrom: Sample auth token on submit button click
const submitClick$ = fromEvent(submitBtn, 'click').pipe(
  withLatestFrom(this.authToken$),
  map(([event, token]) => ({ event, token }))
);`,
      explanation: 'Real-world examples: combineLatest for UI filters, forkJoin for initial parallel HTTP, and withLatestFrom for sampling.'
    },
    seniorPoint: 'If any source observable in `forkJoin` never completes (e.g. an infinite `interval()` or `BehaviorSubject`), the `forkJoin` will never emit anything. Ensure all sources are finite (or pipe them with `take(1)`).',
    followUps: [
      {
        question: 'What happens if you pass an empty array to `forkJoin([])`?',
        answer: 'It completes immediately and emits an empty array (or empty object).'
      },
      {
        question: 'Why does `withLatestFrom` not emit if the secondary stream hasn\'t emitted its first value yet?',
        answer: '`withLatestFrom` requires the secondary stream to have emitted at least one value to sample; otherwise, primary emissions are silently ignored.'
      }
    ],
    keyPointsToMention: [
      'combineLatest: fires on any emission after all have emitted at least once',
      'forkJoin: requires all sources to complete; emits final values (Promise.all equivalent)',
      'withLatestFrom: primary stream drives emissions, secondary stream provides data snapshot',
      'merge: simple concurrent stream pass-through'
    ],
    tags: ['rxjs', 'operators', 'combineLatest', 'forkJoin', 'withLatestFrom', 'merge', 'zip']
  },
  {
    id: 'rxjs_05',
    category: 'rxjs',
    topic: 'Custom RxJS Operators & Pipeable Architecture',
    difficulty: 'Senior',
    question: 'How do you build custom, reusable pipeable RxJS operators in TypeScript, and what makes an operator mathematically pure and leak-free?',
    shortAnswer: 'A custom pipeable operator is a higher-order function that takes configuration parameters and returns an `UnaryFunction<Observable<T>, Observable<R>>` (`(source: Observable<T>) => Observable<R>`). It composes existing RxJS operators or uses `new Observable()` to emit transformed values, forwarding errors and completions while ensuring clean unsubscription.',
    interviewAnswer: 'Custom operators encapsulate repetitive stream logic (like exponential backoff retries, polling until a status is ready, or non-null filtering) without copy-pasting `.pipe()` blocks across services:\n\n1. **Functional Composition (Recommended)**: The cleanest way is returning a function that pipes the source observable through standard operators (like `filter`, `map`, `catchError`). This automatically handles teardowns and cancellation.\n2. **Low-Level `new Observable()` (When composing is insufficient)**: You instantiate `new Observable(subscriber => ...)` and subscribe to the source. You MUST return a teardown function or pass through `source.subscribe(subscriber)` so that when the downstream consumer unsubscribes, the upstream source is also unsubscribed.',
    spokenTip: 'To write a custom operator, write a function that returns `(source: Observable<T>) => source.pipe(...)`. This keeps it pure and handles cleanup automatically.',
    example: {
      language: 'typescript',
      code: `import { Observable, timer, throwError, MonoTypeOperatorFunction } from 'rxjs';
import { mergeMap, retry } from 'rxjs/operators';

// Custom Operator: Retry with Exponential Backoff and Jitter
export function retryWithBackoff<T>({
  maxRetries = 3,
  initialDelayMs = 1000,
  backoffFactor = 2
} = {}): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    source.pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          const delayTime = initialDelayMs * Math.pow(backoffFactor, retryCount - 1);
          // Add random jitter (0 - 300ms) to prevent thundering herd problem
          const jitter = Math.random() * 300;
          console.warn(\`Retry attempt #\${retryCount} after \${delayTime + jitter}ms due to:\`, error.message);
          return timer(delayTime + jitter);
        }
      })
    );
}

// Usage in Service:
// http.get('/api/live-data').pipe(retryWithBackoff({ maxRetries: 4 }))`,
      explanation: 'Custom retryWithBackoff operator applying exponential backoff and random jitter.'
    },
    seniorPoint: 'Always add **Jitter** (randomized millisecond variation) to exponential retry delays. If a backend service crashes and recovers, 1,000 clients retrying at identical predictable intervals will hammer the recovering server with synchronized spikes (the "Thundering Herd" problem).',
    followUps: [
      {
        question: 'What is `MonoTypeOperatorFunction<T>` in RxJS TypeScript types?',
        answer: 'It defines an operator where the input stream type and the output stream type are identical (`Observable<T> -> Observable<T>`).'
      },
      {
        question: 'Why should custom operators avoid holding mutable state variables outside the returned function closure?',
        answer: 'Because an operator function is instantiated once and reused across multiple subscribers; shared mutable state will leak data between concurrent subscriptions.'
      }
    ],
    keyPointsToMention: [
      'Custom pipeable operator structure: (source: Observable<T>) => Observable<R>',
      'Composing existing operators ensures automatic teardown handling',
      'Exponential backoff with jitter to prevent server thundering herd storms',
      'Statelessness and purity across concurrent stream subscriptions'
    ],
    tags: ['rxjs', 'custom-operators', 'retry', 'exponential-backoff', 'architecture', 'resilience']
  },
  {
    id: 'rxjs_06',
    category: 'rxjs',
    topic: 'Error Handling & Stream Resiliency',
    difficulty: 'Senior',
    question: 'Why does placing catchError in the wrong place break RxJS streams permanently, and how do you implement resilient polling and retry architectures?',
    shortAnswer: 'If `catchError` is placed on the *outer* stream, any error terminates the outer observable permanently and it will never emit again. For continuous streams (search boxes, intervals, websockets), `catchError` must be placed inside the *inner* mapping operator (`switchMap`) to catch the error locally and return a fallback observable without killing the outer listener.',
    interviewAnswer: 'Understanding error propagation in RxJS is a key discriminator for senior developers:\n\n1. **The Terminal Nature of RxJS Errors**: By the ReactiveX specification, when an Observable encounters an unhandled error, it calls `observer.error()` and permanently terminates. It cannot recover or emit future values.\n2. **The Inner catchError Pattern**: In a live search input or polling dashboard (`interval().pipe(switchMap(...))`), if the HTTP request fails and `catchError` is at the root level, typing another letter in the search box or the next interval tick will do nothing because the stream is dead.\n3. **Solution**: Place `catchError` inside the `switchMap`: `switchMap(query => http.get(...).pipe(catchError(err => of([]))))`. The inner error is caught, the inner stream completes gracefully with an empty array fallback, and the outer search listener stays alive and responsive to future user inputs.',
    spokenTip: 'Always put catchError inside switchMap, not on the outer stream, so API errors do not kill your search box or polling interval forever.',
    example: {
      language: 'typescript',
      code: `import { fromEvent, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

const searchInput = document.getElementById('search-input')!;

// ✅ RESILIENT STREAM: catchError is INSIDE switchMap!
fromEvent(searchInput, 'input').pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(event => {
    const term = (event.target as HTMLInputElement).value;
    return apiService.search(term).pipe(
      // Catches error for THIS specific HTTP request only!
      catchError(err => {
        notificationService.showError('Search failed. Showing offline results.');
        return of([]); // Emits fallback empty array and completes inner stream
      })
    );
  })
).subscribe(results => {
  // Outer stream NEVER dies! User can type new queries freely!
  renderSearchResults(results);
});`,
      explanation: 'Places catchError inside switchMap to protect the outer event listener from dying on network failure.'
    },
    seniorPoint: 'To emit an error notification while continuing the stream, perform side effects inside `catchError` (like dispatching a toast action) and return `EMPTY` or `of(fallbackValue)` rather than re-throwing with `throwError`.',
    followUps: [
      {
        question: 'What is the difference between returning `EMPTY` and `of(null)` in `catchError`?',
        answer: '`of(null)` emits `null` to downstream subscribers and then completes. `EMPTY` emits nothing at all and completes immediately.'
      },
      {
        question: 'How do you retry a failed stream only for network errors (503/504) while failing fast for client errors (400/401)?',
        answer: 'Inside the `retry` delay callback, inspect `error.status`. If `400 <= status < 500`, re-throw immediately using `throw error`; if `status >= 500`, return a `timer(1000)` to retry.'
      }
    ],
    keyPointsToMention: [
      'Unhandled RxJS errors terminate the observable contract permanently',
      'Inner catchError placement inside switchMap protects outer stream lifecycle',
      'Returning of(fallback) or EMPTY for graceful stream degradation',
      'Conditional retries based on HTTP status codes (5xx vs 4xx)'
    ],
    tags: ['rxjs', 'error-handling', 'catchError', 'switchMap', 'resilience', 'architecture']
  }
];
