import { Question } from '../types';

export const angularQuestions: Question[] = [
  {
    id: 'ng_01',
    category: 'angular',
    topic: 'Modern Angular & Signals',
    difficulty: 'Senior',
    question: 'How do Angular Signals work, what is the difference between `signal()`, `computed()`, and `effect()`, and how do they enable Zoneless Angular?',
    shortAnswer: 'Signals provide fine-grained, synchronous reactivity based on getter functions. `signal()` creates a writable reactive value; `computed()` creates a memoized, lazily evaluated derived signal; `effect()` executes side effects in a reactive context when its dependent signals change. Signals notify the framework of exact value changes, allowing Angular to re-render dirty views directly without traversing the entire component tree via Zone.js.',
    seniorPoint: 'Signals establish a dynamic dependency graph at runtime using push/pull mechanics. When a signal changes, it notifies dependents that they are stale (push), but `computed()` values are re-evaluated only when read (pull). This eliminates Zone.js monkey-patching overhead.',
    spokenTip: 'Signals replace coarse component tree dirty-checking with fine-grained value tracking, paving the way for full Zoneless Angular.',
    interviewAnswer: 'Angular Signals represent a reactive value producer. \n- `writable = signal(initialValue)` allows `.set()`, `.update()`, and `.asReadonly()`.\n- `derived = computed(() => fn())` is memoized: it tracks any signals read during execution dynamically and only re-computes when dependencies change and the value is read.\n- `effect()` runs side-effects (like logging, charts, DOM sync) when signals update inside an injection context.\n\nIn traditional Angular, Zone.js monkey-patches browser async APIs and marks the entire application root-to-leaf for dirty checking. With Signals and Zoneless Angular (`provideExperimentalZonelessChangeDetection()`), Angular knows precisely which component view consumes which signal, enabling localized, high-performance DOM updates.',
    keyPointsToMention: [
      'signal() for writable state, computed() for memoized derived state, effect() for side-effects',
      'Dynamic dependency tracking (unreferenced branches stop tracking automatically)',
      'Zoneless change detection: localized view updates without Zone.js monkey-patching',
      'toSignal() and toObservable() for RxJS interoperability'
    ],
    whatInterviewersLookFor: [
      'Understanding of glitched-free derived execution and lazy pull evaluation',
      'Rules of effect() (avoid setting signals inside effects to avoid infinite loops, untracked usage)',
      'Signal inputs (input(), input.required()), output(), and model()'
    ],
    followUpQuestions: [
      'What is `linkedSignal` introduced in Angular 19 and what problem does it solve?',
      'Why shouldn\'t you mutate objects inside a `signal.update()` call?'
    ],
    codeExample: `import { Component, signal, computed, effect, input, output } from '@angular/core';

@Component({
  selector: 'app-user-stats',
  standalone: true,
  template: \`
    <div class="stats-card">
      <h3>{{ username() }}</h3>
      <p>Points: {{ score() }} | Multiplier: {{ multiplier() }}</p>
      <p>Total: <strong>{{ totalPoints() }}</strong></p>
      <button (click)="addPoints(10)">+10 Points</button>
    </div>
  \`
})
export class UserStatsComponent {
  // Signal Inputs & Outputs (Modern Angular)
  username = input.required<string>();
  multiplier = input<number>(1);
  scoreChanged = output<number>();

  // Writable & Computed Signals
  score = signal<number>(100);
  totalPoints = computed(() => this.score() * this.multiplier());

  constructor() {
    // Side effect tracking
    effect(() => {
      console.log(\`User \${this.username()} has total points: \${this.totalPoints()}\`);
    });
  }

  addPoints(amount: number) {
    this.score.update(prev => prev + amount);
    this.scoreChanged.emit(this.score());
  }
}`,
    tags: ['angular', 'signals', 'computed', 'effect', 'zoneless', 'reactivity']
  },
  {
    id: 'ng_02',
    category: 'angular',
    topic: 'Modern Control Flow & @defer',
    difficulty: 'Senior',
    question: 'Explain Angular’s Modern Control Flow (`@if`, `@for`, `@switch`) and how `@defer` revolutionizes lazy loading and Core Web Vitals.',
    shortAnswer: 'Modern Control Flow replaces structural directives (`*ngIf`, `*ngFor`) with built-in compiler syntax, requiring `track` in `@for` to prevent unnecessary DOM recreation. `@defer` automatically generates lazy-loaded JavaScript chunks for components/templates inside it and delays download/render until specific triggers are met (e.g. `on viewport`, `on hover`, `on interaction`).',
    seniorPoint: '`@defer` operates at compile-time: Angular CLI extracts dependencies inside `@defer` into separate Webpack/Vite chunks without manual route splitting. Combined with `@placeholder`, `@loading`, and `@error`, it drastically optimizes Initial Bundle Size and Largest Contentful Paint (LCP).',
    spokenTip: '`@defer` is declarative component-level code-splitting driven by real user viewport or interaction triggers.',
    interviewAnswer: 'Angular\'s built-in control flow eliminates heavy directive imports and improves type narrowing. `@for (item of items; track item.id)` mandates a tracking identifier, avoiding the classic bug of full DOM list teardowns. \n\n`@defer` introduces declarative deferred loading. A heavy chart or comments section wrapped in `@defer (on viewport)` won\'t download its JavaScript bundle or render until the user scrolls it into view. Triggers include:\n- `on viewport(target)` (via IntersectionObserver)\n- `on interaction(element)`\n- `on hover`\n- `on idle` (requestIdleCallback)\n- `on timer(5s)`\n- `when condition` (custom boolean/signal condition)',
    keyPointsToMention: [
      '@if / @else if / @else provides seamless TypeScript type narrowing in templates',
      '@for requires track expression (track item.id), vastly outperforming untracked *ngFor',
      '@defer automatically creates separate async chunks for all enclosed standalone components',
      '@defer secondary blocks: @placeholder, @loading(minimum 500ms), and @error'
    ],
    whatInterviewersLookFor: [
      'Practical impact on LCP and Initial Bundle Size',
      'Understanding of when `@placeholder` vs `@loading` is displayed'
    ],
    codeExample: `@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [HeavyAnalyticsChartComponent, CommentsFeedComponent],
  template: \`
    <!-- Modern Control Flow with strict track -->
    @if (product(); as prod) {
      <h1>{{ prod.name }}</h1>
      <p>Price: {{ prod.price | currency }}</p>
    } @else {
      <p>Loading product details...</p>
    }

    <!-- Component-Level Lazy Loading via @defer -->
    @defer (on viewport; prefetch on idle) {
      <app-heavy-analytics-chart [data]="analyticsData()" />
    } @placeholder (minimum 300ms) {
      <div class="chart-skeleton">Chart will appear on scroll</div>
    } @loading (after 100ms; minimum 500ms) {
      <div class="spinner">Downloading chart module...</div>
    } @error {
      <p class="error">Failed to load analytics chart.</p>
    }
  \`
})
export class ProductDetailComponent {
  product = signal<Product | null>(null);
  analyticsData = signal<AnalyticsData | null>(null);
}`,
    tags: ['angular', 'control-flow', 'defer', 'lazy-loading', 'performance', 'lcp']
  },
  {
    id: 'ng_03',
    category: 'angular',
    topic: 'Change Detection & OnPush',
    difficulty: 'Senior',
    question: 'Contrast Default Change Detection with `ChangeDetectionStrategy.OnPush`. How does `ChangeDetectorRef` work, and what triggers an OnPush component update?',
    shortAnswer: 'Default change detection runs top-down through every component on any async event (DOM event, HTTP, timer) intercepted by Zone.js. `OnPush` tells Angular to skip checking a component and its subtree unless: 1) an `@Input` reference changes (immutability required), 2) an event handler inside the component fires, 3) an `async` pipe receives a new emission, 4) a Signal read in the template updates, or 5) `markForCheck()` is explicitly called.',
    seniorPoint: '`markForCheck()` does not immediately run change detection; it marks all ancestors up to the root as dirty so they are checked during the next CD cycle. `detectChanges()` runs synchronous change detection immediately on the current component and its children only.',
    spokenTip: '`OnPush` turns Angular from an aggressive "check everything" model into an opt-in, event/input-driven change detection model.',
    interviewAnswer: 'In Default mode, Zone.js triggers change detection globally for any microtask or macrotask, checking every binding in the application tree. This causes performance degradation in large apps.\nWith `ChangeDetectionStrategy.OnPush`, Angular checks the component only when:\n1. Input references change by value (`prev !== curr` strict equality check).\n2. An event listener bound in the component\'s template triggers.\n3. An `Observable` bound via the `async` pipe emits (which internally calls `markForCheck()`).\n4. A `signal()` read in the template changes.\n5. `ChangeDetectorRef.markForCheck()` is called manually.\n\n`OnPush` relies on immutability—mutating an array or object in-place without creating a new reference will fail to trigger change detection in child components.',
    keyPointsToMention: [
      'Zone.js dirty checking mechanism vs OnPush skip optimization',
      'Five triggers for OnPush evaluation (Input ref change, template event, async pipe, signals, markForCheck)',
      'Difference between markForCheck() (flags path to root) and detectChanges() (immediate local run)',
      'detach() and reattach() for high-frequency streaming telemetry dashboards'
    ],
    whatInterviewersLookFor: [
      'Emphasis on immutable state management when using OnPush',
      'Understanding of why mutating an array with .push() breaks OnPush child rendering'
    ],
    codeExample: `import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, inject } from '@angular/core';

@Component({
  selector: 'app-user-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="user-row">
      <span>{{ user.name }}</span>
      <span>{{ user.status }}</span>
      <button (click)="refreshLocal()">Refresh Status</button>
    </div>
  \`
})
export class UserRowComponent {
  @Input({ required: true }) user!: { id: string; name: string; status: string };
  private cdr = inject(ChangeDetectorRef);

  refreshLocal() {
    // Template event listener automatically marks component dirty in OnPush
  }

  // If receiving updates from an external WebSocket outside Angular zone:
  onExternalWebSocketUpdate(newStatus: string) {
    this.user.status = newStatus;
    // Must notify Angular explicitly
    this.cdr.markForCheck();
  }
}`,
    tags: ['angular', 'change-detection', 'onpush', 'zonejs', 'cdr', 'performance']
  },
  {
    id: 'ng_04',
    category: 'angular',
    topic: 'Dependency Injection Hierarchy',
    difficulty: 'Senior',
    question: 'How does Angular’s Dependency Injection (DI) injector hierarchy work? Detail `providedIn: "root"`, Component/Node injectors, `InjectionToken`, and provider types.',
    shortAnswer: 'Angular DI consists of two parallel injector trees: the Environment Injector tree (Root, Platform, Environment) and the Element/Node Injector tree (created per DOM component/directive). Angular resolves tokens by searching up the Element Injector tree; if not found, it traverses the Environment Injector tree to Root.',
    seniorPoint: '`providedIn: "root"` is tree-shakeable: if no component injects the service, its code is excluded from the production bundle. Component-level `providers: [MyService]` creates a distinct service instance tied to the component lifecycle and destroyed when the component unmounts.',
    spokenTip: 'DI resolution starts at the requesting DOM node and bubbles up through parent component injectors before falling back to the Environment/Root injector.',
    interviewAnswer: 'Angular\'s DI engine uses hierarchical resolution:\n1. **Element Injector**: If a component or directive provides a service in its `providers: [...]` or `viewProviders: [...]`, that instance is scoped to that element and its descendants. It is garbage collected when the component destroys.\n2. **Environment Injector**: Services registered via `providedIn: "root"` or `provideHttpClient()` in `app.config.ts`. Singletons across the application.\n\nProvider recipes:\n- `useClass`: Maps a token to an alternate implementation class (e.g. `MockAuthService` in testing).\n- `useValue`: Maps an `InjectionToken` to a static object or configuration object.\n- `useFactory`: Runs a factory function with injected dependencies to construct complex services.\n- `useExisting`: Aliases one token to an existing provider.\n- `multi: true`: Collects multiple providers into an array for a single token (e.g. `HTTP_INTERCEPTORS` or `APP_INITIALIZER`).\n\nThe modern `inject(TOKEN)` function allows functional composition outside constructors.',
    keyPointsToMention: [
      'Two injector hierarchies: Element/Node Injectors vs Environment/Root Injectors',
      'Resolution order: Local Element -> Parent Elements -> Environment / Root -> NullInjector (throws error)',
      'Resolution modifiers: @Optional(), @Self(), @SkipSelf(), @Host()',
      'InjectionToken and multi: true patterns'
    ],
    whatInterviewersLookFor: [
      'Clear differentiation between root singletons and component-scoped instances',
      'Knowledge of the modern inject() function and functional DI'
    ],
    codeExample: `import { InjectionToken, Injectable, inject } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  timeoutMs: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

// Tree-shakeable singleton service
@Injectable({ providedIn: 'root' })
export class ApiService {
  private config = inject(APP_CONFIG);

  fetchEndpoint(path: string) {
    return \`\${this.config.apiUrl}/\${path}\`;
  }
}

// Factory Provider in app.config.ts
export const appConfigProviders = [
  {
    provide: APP_CONFIG,
    useFactory: (): AppConfig => ({
      apiUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://api.prod.com',
      timeoutMs: 5000
    })
  }
];`,
    tags: ['angular', 'dependency-injection', 'inject', 'injection-token', 'providers']
  },
  {
    id: 'ng_05',
    category: 'angular',
    topic: 'Reactive & Typed Forms',
    difficulty: 'Senior',
    question: 'How do Strictly Typed Reactive Forms work in modern Angular, and how do you design custom asynchronous validators with debounce and cancellation?',
    shortAnswer: 'Strictly Typed Forms (Angular 14+) ensure `FormGroup`, `FormControl`, and `FormArray` track exact model types without dropping to `any`. Custom async validators return `Observable<ValidationErrors | null>` and should be piped through `timer()` for debouncing and `switchMap()` to automatically cancel in-flight validation requests on new keystrokes.',
    seniorPoint: 'Async validators run only after all synchronous validators pass. To prevent spamming backend validation endpoints (e.g., username availability check), you must debounce inside the validator observable stream using RxJS `timer()` or `debounceTime()`.',
    spokenTip: 'Typed Reactive Forms give complete compile-time guarantees over form value shapes, dirty state, and validation payloads.',
    interviewAnswer: 'Since Angular 14, Reactive Forms are strictly typed. `FormGroup<{ email: FormControl<string>; age: FormControl<number | null> }>` preserves full type inference across `.value`, `.getRawValue()`, and `.valueChanges`.\n\nFor asynchronous validation (e.g., checking if an email is already taken):\n1. The validator function returns an `AsyncValidatorFn`: `(control: AbstractControl) => Observable<ValidationErrors | null>`.\n2. We pipe the control value through `timer(300)` for debouncing.\n3. We use `switchMap` to call the backend API, which automatically cancels in-flight HTTP checks if the user continues typing.\n4. If the backend reports taken, we emit `{ emailTaken: true }`; otherwise `null`.',
    keyPointsToMention: [
      'Strictly typed FormControl<T> vs FormRecord vs FormArray',
      'getValue() vs getRawValue() (getRawValue includes disabled controls)',
      'Async validator lifecycle: runs only after sync validation passes',
      'Debouncing and cancelling async validator HTTP calls via RxJS timer & switchMap'
    ],
    whatInterviewersLookFor: [
      'Understanding of memory safety and unsubscription in custom form controls (ControlValueAccessor)',
      'Proper handling of disabled form control value omission in .value vs .getRawValue()'
    ],
    codeExample: `import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export function uniqueUsernameValidator(http: HttpClient): AsyncValidatorFn {
  return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    // Debounce 300ms, then call validation endpoint with switchMap cancellation
    return timer(300).pipe(
      switchMap(() => http.get<{ available: boolean }>(\`/api/check-user?username=\${control.value}\`)),
      map(res => (res.available ? null : { usernameTaken: true })),
      catchError(() => of(null)) // Degrade gracefully on network error
    );
  };
}

// Typed Form Initialization
export class RegistrationComponent {
  private http = inject(HttpClient);

  form = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
      asyncValidators: [uniqueUsernameValidator(this.http)]
    })
  });
}`,
    tags: ['angular', 'forms', 'reactive-forms', 'typed-forms', 'async-validators']
  },
  {
    id: 'ng_06',
    category: 'angular',
    topic: 'HTTP Interceptors & Functional Pipeline',
    difficulty: 'Senior',
    question: 'How do modern Functional HTTP Interceptors work in Angular? How do you implement automated JWT 401 token refresh with request queueing?',
    shortAnswer: 'Functional interceptors (`HttpInterceptorFn`) intercept outgoing requests and incoming responses. To handle 401 Unauthorized errors: catch the 401, check a `isRefreshing` lock, call the refresh token endpoint, cache the new token, update queued requests with the new header via `switchMap`, and retry the original request with `clone()`.',
    seniorPoint: 'A critical senior trap is race conditions when multiple parallel HTTP requests fail with 401 simultaneously. You must ensure only ONE refresh request is triggered while other failed requests wait on a `BehaviorSubject` / `filter` queue for the new token.',
    spokenTip: 'Functional interceptors wrap HttpClient requests in a middleware onion pipeline using `next(clonedReq)`.',
    interviewAnswer: 'In modern Angular, `HttpInterceptorFn` replaces legacy class-based interceptors and is configured via `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`.\n\nWhen a 401 occurs:\n1. The interceptor intercepts the error via `catchError`.\n2. If a token refresh is already in progress, parallel requests pause and subscribe to a `refreshTokenSubject` until the new token is emitted.\n3. The first 401 triggers the auth service refresh call.\n4. Upon successful refresh, the new JWT is emitted to the queue, requests are cloned with the updated `Authorization: Bearer <token>` header, and re-executed.\n5. If the refresh token itself is expired/invalid (403), the session is cleared and the user is redirected to `/login`.',
    keyPointsToMention: [
      'Immutability: HttpRequest is immutable; must use req.clone({ setHeaders: { ... } })',
      'Functional interceptors configured via withInterceptors([])',
      'Handling 401 token refresh concurrency using BehaviorSubject lock/queue',
      'Proper logout and route navigation when refresh fails'
    ],
    whatInterviewersLookFor: [
      'Awareness of request cloning requirement',
      'Prevention of infinite 401 retry loops (never refresh on the refresh endpoint itself)'
    ],
    codeExample: `import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Clone request with Bearer token if present
  let authReq = req;
  if (token) {
    authReq = req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Catch 401 (Unauthorized) and not on auth endpoints
      if (error.status === 401 && !req.url.includes('/api/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((newToken) => {
              isRefreshing = false;
              refreshTokenSubject.next(newToken.accessToken);
              return next(req.clone({ setHeaders: { Authorization: \`Bearer \${newToken.accessToken}\` } }));
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
          // Wait for existing refresh to complete
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(newToken => next(req.clone({ setHeaders: { Authorization: \`Bearer \${newToken}\` } })))
          );
        }
      }
      return throwError(() => error);
    })
  );
};`,
    tags: ['angular', 'http-client', 'interceptors', 'auth', 'jwt', 'token-refresh']
  }
];
