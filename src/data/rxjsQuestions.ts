import { Question } from '../types';

export const rxjsQuestions: Question[] = [
  {
    id: 'rxjs_01',
    category: 'rxjs',
    topic: 'Higher-Order Mapping Operators',
    difficulty: 'Senior',
    question: 'Compare `switchMap`, `mergeMap`, `concatMap`, and `exhaustMap`. Provide a real-world frontend scenario for each.',
    shortAnswer: '`switchMap` cancels previous inner observables on new emission (Search autocomplete). `mergeMap` runs all inner observables concurrently in parallel (Bulk uploads). `concatMap` queues inner observables to run sequentially in order (Payment or ordered save steps). `exhaustMap` ignores new outer emissions while an inner observable is currently executing (Login button spam prevention).',
    seniorPoint: 'Using `mergeMap` for HTTP mutations can cause race conditions and out-of-order writes. Using `switchMap` for write/POST mutations will cancel requests midway if the user clicks quickly. Choose your flattening strategy strictly based on idempotency and ordering guarantees.',
    spokenTip: 'I choose higher-order operators based on two decisions: concurrency vs sequential execution, and cancellation vs suppression.',
    interviewAnswer: 'All 4 operators map an outer emission to an inner Observable and flatten the result:\n1. **switchMap (Switch / Cancel)**: When a new outer value arrives, it immediately unsubscribes/cancels the previous active inner observable. *Use case: Live search bar autocomplete where previous queries are stale.*\n2. **mergeMap (Concurrent / Parallel)**: Maintains simultaneous active inner subscriptions with no queueing or cancellation. *Use case: Parallel image uploads or fetching independent card details.*\n3. **concatMap (Sequential / Queued)**: Waits for the current inner observable to complete before starting the next. Preserves exact emission order. *Use case: Sequential transactional updates or chat message delivery.*\n4. **exhaustMap (Ignore / Lockout)**: If an inner observable is currently executing, any new outer emissions are dropped/ignored until completion. *Use case: Submit/Login button clicks to prevent duplicate submissions.*',
    keyPointsToMention: [
      'switchMap: cancels in-flight inner observable (ideal for GET queries)',
      'mergeMap: parallel execution without ordering guarantees',
      'concatMap: FIFO queueing guaranteeing strict sequential order',
      'exhaustMap: locks and ignores incoming triggers while active (ideal for non-reentrant actions)'
    ],
    whatInterviewersLookFor: [
      'Identification of race condition bugs when switchMap is used incorrectly on mutation endpoints',
      'Clear decision tree explaining when to pick each operator'
    ],
    codeExample: `import { fromEvent, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, mergeMap, concatMap, exhaustMap } from 'rxjs/operators';

// 1. Search Box: switchMap (Cancels stale queries)
searchBoxInput$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => http.get(\`/api/search?q=\${query}\`))
);

// 2. Submit Button: exhaustMap (Ignores extra clicks while pending)
submitButtonClick$.pipe(
  exhaustMap(() => http.post('/api/checkout', payload))
);

// 3. Sequential Sync: concatMap (Maintains order)
offlineQueueItems$.pipe(
  concatMap(item => http.put(\`/api/sync/\${item.id}\`, item))
);

// 4. Parallel File Uploads: mergeMap
selectedFiles$.pipe(
  mergeMap(file => uploadFile(file), 4) // max 4 concurrent uploads
);`,
    tags: ['rxjs', 'switchMap', 'mergeMap', 'concatMap', 'exhaustMap', 'operators']
  },
  {
    id: 'rxjs_02',
    category: 'rxjs',
    topic: 'Subjects & Multicasting',
    difficulty: 'Senior',
    question: 'Compare `Subject`, `BehaviorSubject`, `ReplaySubject`, and `AsyncSubject`. How do `share()` and `shareReplay()` multicasting work?',
    shortAnswer: '`Subject` is a multicast observable with no initial value or memory; `BehaviorSubject` requires an initial value and emits its current value to new subscribers immediately; `ReplaySubject(N)` replays the last N emissions to new subscribers; `AsyncSubject` emits only the final value upon completion. `shareReplay({ bufferSize: 1, refCount: true })` caches and multicasts cold observables to prevent duplicate HTTP requests.',
    seniorPoint: 'Always specify `refCount: true` when using `shareReplay(1)`. Without `refCount: true`, the underlying source subscription remains open forever even after all consumers unsubscribe, leaking memory and network connections.',
    spokenTip: '`BehaviorSubject` represents current state (e.g. currentUser$); `ReplaySubject` buffers history; `Subject` is for stateless events.',
    interviewAnswer: '1. **Subject**: Stateless event emitter. Late subscribers miss past values.\n2. **BehaviorSubject**: Holds current state value (accessible via `.value`). Requires an initial seed and emits the latest state immediately upon subscription. Great for UI store values.\n3. **ReplaySubject**: Buffers N values (or values within a time window) and replays them to late subscribers regardless of when they subscribe.\n4. **AsyncSubject**: Emits only the last emitted value when the stream completes (similar to a Promise).\n\n**Multicasting**: Cold observables (like `HttpClient.get()`) execute their producer logic independently for every subscriber. Wrapping the stream with `shareReplay({ bufferSize: 1, refCount: true })` turns it into a hot multicast stream, executing the HTTP call once and sharing the cached response across multiple UI components.',
    keyPointsToMention: [
      'BehaviorSubject requires initial value and stores current state (.value)',
      'ReplaySubject buffers history for late subscribers without needing an initial value',
      'Cold (producer created per subscription) vs Hot (shared producer)',
      'shareReplay({ bufferSize: 1, refCount: true }) for request caching and memory leak prevention'
    ],
    whatInterviewersLookFor: [
      'Knowledge of refCount: true in shareReplay to avoid zombie subscriptions',
      'Architectural understanding of single-source-of-truth service state'
    ],
    codeExample: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // 1. BehaviorSubject for active user session state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // 2. Cached Multicast HTTP Request
  private profileCache$?: Observable<UserProfile>;

  getProfile(): Observable<UserProfile> {
    if (!this.profileCache$) {
      this.profileCache$ = this.http.get<UserProfile>('/api/profile').pipe(
        // Buffer 1 value, automatically unsubscribe from source when all subscribers leave
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.profileCache$;
  }
}`,
    tags: ['rxjs', 'subject', 'behavior-subject', 'replay-subject', 'shareReplay', 'multicast']
  },
  {
    id: 'rxjs_03',
    category: 'rxjs',
    topic: 'Subscription Management & Memory Leaks',
    difficulty: 'Senior',
    question: 'How do you prevent memory leaks in Angular/RxJS applications? Contrast `takeUntilDestroyed()`, `takeUntil()`, `async` pipe, and `toSignal()`.',
    shortAnswer: 'Uncleaned subscriptions hold references to component instances in closure memory, preventing garbage collection. Modern best practices: 1) Use Angular `async` pipe or `toSignal()` to let the framework manage subscription lifecycles automatically; 2) In component TypeScript code, use `takeUntilDestroyed()` inside the injection context; 3) Use `take(1)` / `first()` for one-shot events.',
    seniorPoint: '`takeUntilDestroyed()` must be called inside an injection context (constructor or field initializer). If called inside lifecycle hooks like `ngOnInit`, you must pass the `DestroyRef` explicitly: `takeUntilDestroyed(this.destroyRef)`.',
    spokenTip: 'Never subscribe inside a component without an automated teardown strategy.',
    interviewAnswer: 'When a component subscribes to an infinite observable (e.g. interval, router events, state stream), the observable retains a reference to the observer callback. If the component destroys, this reference keeps the component tree alive in heap memory.\n\nModern teardown strategies:\n1. **`async` Pipe / Signals (`toSignal()`)**: Declarative in templates; automatically subscribes and unsubscribes on view destroy.\n2. **`takeUntilDestroyed()` (Angular 16+)**: Modern operator that ties the stream lifecycle directly to the Angular `DestroyRef`.\n3. **`takeUntil(destroy$)` pattern**: Legacy pattern using a `Subject<void>` triggered in `ngOnDestroy`.\n4. **Never nest `.subscribe()`**: Nested subscriptions cause memory leaks and race conditions—always flatten using `switchMap`, `mergeMap`, or `combineLatest`.',
    keyPointsToMention: [
      'Why subscriptions leak: open references in closure memory prevent garbage collection',
      'takeUntilDestroyed() and DestroyRef',
      'Async pipe & toSignal() declarative auto-unsubscription',
      'Anti-pattern: nested .subscribe() calls (pyramid of doom)'
    ],
    whatInterviewersLookFor: [
      'Strong advocacy for declarative streams over manual imperative subscriptions',
      'Proper understanding of injection context requirements for takeUntilDestroyed'
    ],
    codeExample: `import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { interval, Observable } from 'rxjs';
import { UserService } from './user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: \`
    <!-- 1. toSignal or async pipe handles teardown automatically -->
    <p>Active User: {{ user()?.name }}</p>
    <p>Timer: {{ timer$ | async }}</p>
  \`
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  // Declarative Signal Conversion (Zero memory leak risk)
  user = toSignal(this.userService.currentUser$);
  timer$ = interval(1000);

  // Field initializer has injection context
  private polling$ = interval(5000).pipe(
    takeUntilDestroyed()
  ).subscribe(val => console.log('Polling...', val));

  ngOnInit() {
    // Inside lifecycle hook: must pass DestroyRef explicitly
    interval(10000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}`,
    tags: ['rxjs', 'memory-leaks', 'takeUntilDestroyed', 'async-pipe', 'toSignal', 'destroyRef']
  },
  {
    id: 'rxjs_04',
    category: 'rxjs',
    topic: 'Combination Operators',
    difficulty: 'Senior',
    question: 'Compare `combineLatest`, `forkJoin`, `zip`, `withLatestFrom`, and `merge`. When do you choose each?',
    shortAnswer: '`combineLatest` emits when any source emits (after all have emitted at least once); `forkJoin` acts like `Promise.all` (waits for all streams to complete and emits the last values); `withLatestFrom` samples the latest value of secondary streams only when the master stream emits; `zip` pairs emissions 1-to-1 by index; `merge` combines multiple streams into a single stream as events occur.',
    seniorPoint: '`combineLatest` will never emit if any input observable fails to emit at least once. If one stream is a cold source waiting on user action, your entire combined stream will hang indefinitely. Provide `startWith()` to unblock.',
    spokenTip: '`forkJoin` for parallel API loading on page init; `combineLatest` for dynamic multi-filter UI states; `withLatestFrom` for sampling state on button clicks.',
    interviewAnswer: '1. **forkJoin**: Equivalent to `Promise.all`. Takes an array/dictionary of observables, waits for all to complete, and emits the final value of each. Ideal for page bootstrap data loading.\n2. **combineLatest**: Emits an array of latest values whenever ANY source stream emits, provided every source has emitted at least once. Ideal for combining reactive form filters, search text, and sort order into a single query stream.\n3. **withLatestFrom**: Master-slave relationship. Only emits when the master stream emits, pulling in the latest snapshot value from auxiliary streams. Ideal for combining a "Submit" button click with the current state of a form without re-triggering on form changes.\n4. **merge**: Flattens multiple streams into one, emitting values in real-time as they occur from any source.\n5. **zip**: Strictly pairs 1st with 1st, 2nd with 2nd. If streams emit at different rates, memory buffers can grow.',
    keyPointsToMention: [
      'forkJoin requires completion from all streams (fails if an infinite stream like interval is passed)',
      'combineLatest requires at least one emission from every source before producing its first output',
      'withLatestFrom prevents auxiliary streams from re-triggering the pipeline',
      'Use startWith() to seed streams that might not emit immediately'
    ],
    whatInterviewersLookFor: [
      'Ability to select the exact right combination operator for complex UI scenarios',
      'Knowledge of the forkJoin completion requirement'
    ],
    codeExample: `import { combineLatest, forkJoin, fromEvent } from 'rxjs';
import { map, withLatestFrom, startWith } from 'rxjs/operators';

// 1. forkJoin: Load Dashboard Metadata on Route Entry
forkJoin({
  user: http.get<User>('/api/me'),
  permissions: http.get<string[]>('/api/permissions'),
  config: http.get<Config>('/api/config')
}).subscribe(({ user, permissions, config }) => {
  console.log('All loaded:', user, permissions);
});

// 2. combineLatest: Multi-facet Filter Query Pipeline
combineLatest([
  searchFilter$.pipe(startWith('')),
  categoryFilter$.pipe(startWith('all')),
  sortOrder$.pipe(startWith('asc'))
]).pipe(
  map(([search, category, sort]) => ({ search, category, sort }))
);

// 3. withLatestFrom: Form Submission Snapshot
fromEvent(submitBtn, 'click').pipe(
  withLatestFrom(currentFormValues$, authUserId$),
  map(([clickEvent, form, userId]) => ({ ...form, submittedBy: userId }))
);`,
    tags: ['rxjs', 'combineLatest', 'forkJoin', 'withLatestFrom', 'merge', 'combination-operators']
  }
];
