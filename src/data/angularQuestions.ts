import { Question } from '../types';

export const angularQuestions: Question[] = [
  {
    id: 'ng_01',
    category: 'angular',
    topic: 'Modern Angular & Signals',
    difficulty: 'Senior',
    question: 'How do Angular Signals work, what is the difference between signal(), computed(), and effect(), and how do they enable Zoneless Angular?',
    shortAnswer: 'Signals provide fine-grained synchronous reactivity. `signal()` creates a writable value with `.set()` and `.update()`. `computed()` creates a memoized, lazily evaluated derived value. `effect()` runs side effects when dependent signals change. Signals track exact read dependencies at runtime. This lets Angular know precisely which component view needs re-rendering without checking the entire component tree via Zone.js.',
    interviewAnswer: 'In modern Angular, Signals introduce fine-grained reactivity. A writable signal holds a value and notifies consumers when updated. `computed()` creates a derived signal that is memoized—it only re-evaluates when a dependency changes and its value is actually read (pull-based evaluation).\n\n`effect()` is for side-effects like syncing with local storage or rendering charts when signal values change.\n\nTraditional Angular relies on Zone.js to monkey-patch all browser async APIs and trigger change detection top-down from the root. With Signals and Zoneless mode (`provideExperimentalZonelessChangeDetection()`), Angular tracks exactly which DOM nodes depend on which signals. When a signal emits, Angular marks only that specific view dirty, eliminating Zone.js runtime overhead.',
    spokenTip: 'I explain Signals as a push-pull reactive graph: changes push a dirty notification, but values are pulled and memoized only when read.',
    example: {
      language: 'typescript',
      code: `import { Component, signal, computed, effect, input, output } from '@angular/core';

@Component({
  selector: 'app-user-cart',
  standalone: true,
  template: \`
    <div class="cart-summary">
      <h3>Items: {{ itemCount() }}</h3>
      <p>Subtotal: {{ subtotal() | currency }}</p>
      <p>Tax (10%): {{ tax() | currency }}</p>
      <p>Total: <strong>{{ grandTotal() | currency }}</strong></p>
      <button (click)="addItem(25)">Add $25 Item</button>
    </div>
  \`
})
export class UserCartComponent {
  // Signal Inputs (Modern Angular)
  discountRate = input<number>(0);
  cartUpdated = output<number>();

  // Writable State
  itemPrices = signal<number[]>([50, 100]);

  // Memoized Computed Signals
  itemCount = computed(() => this.itemPrices().length);
  subtotal = computed(() => this.itemPrices().reduce((sum, p) => sum + p, 0));
  tax = computed(() => this.subtotal() * 0.1);
  grandTotal = computed(() => (this.subtotal() + this.tax()) * (1 - this.discountRate()));

  constructor() {
    // Side effect inside injection context
    effect(() => {
      console.log(\`Cart total changed: \${this.grandTotal()}\`);
    });
  }

  addItem(price: number) {
    this.itemPrices.update(items => [...items, price]);
    this.cartUpdated.emit(this.grandTotal());
  }
}`,
      explanation: 'Demonstrates writable signals with immutable updates, computed derivation chains, and signal input/output.'
    },
    seniorPoint: 'Signals establish a dynamic dependency graph at runtime. If a conditional branch in a computed signal stops reading a signal, that dependency is automatically unsubscribed, preventing memory leaks and unnecessary recalculations.',
    followUps: [
      {
        question: 'What is linkedSignal in Angular 19 and what problem does it solve?',
        answer: '`linkedSignal` is a writable signal that automatically resets or recalculates its value when a source signal changes, but still allows local manual updates without writing complex effects.'
      },
      {
        question: 'Why shouldn\'t you mutate objects inside a signal.update() call?',
        answer: 'Signals check reference equality (`Object.is` by default). Mutating an object or array in place does not change its reference, so dependent computed signals and templates will not update.'
      },
      {
        question: 'How do you bridge between RxJS Observables and Signals?',
        answer: 'Use `toSignal(observable$)` to convert an Observable to a Signal with automatic subscription management, and `toObservable(signal)` to turn a Signal into an RxJS stream.'
      }
    ],
    keyPointsToMention: [
      'signal() for writable state, computed() for memoized derived state, effect() for side-effects',
      'Dynamic runtime dependency tracking (unreferenced branches unsubscribe automatically)',
      'Zoneless change detection: localized view updates without Zone.js monkey-patching',
      'RxJS interoperability via toSignal() and toObservable()'
    ],
    tags: ['angular', 'signals', 'computed', 'effect', 'zoneless', 'reactivity']
  },
  {
    id: 'ng_02',
    category: 'angular',
    topic: 'Modern Control Flow & @defer',
    difficulty: 'Senior',
    question: 'Explain Angular’s Modern Control Flow (@if, @for, @switch) and how @defer optimizes lazy loading and Core Web Vitals.',
    shortAnswer: 'Modern Control Flow replaces structural directives (`*ngIf`, `*ngFor`) with built-in compiler syntax, requiring `track` in `@for` to prevent list teardowns. `@defer` automatically generates lazy-loaded JavaScript chunks for components inside it, downloading and rendering them only when specific triggers fire (e.g. `on viewport`, `on interaction`, `on idle`).',
    interviewAnswer: 'Angular\'s modern control flow offers faster compilation, better type narrowing, and cleaner syntax compared to legacy structural directives. In `@for (item of items; track item.id)`, the `track` expression is mandatory. This ensures Angular recycles DOM elements when items are added or reordered instead of tearing down the entire DOM list.\n\n`@defer` is component-level deferred loading. Anything inside a `@defer` block is automatically extracted by the CLI into a separate lazy-loaded bundle. We can trigger the download with `on viewport` (using IntersectionObserver), `on interaction`, `on hover`, or `on idle`. We pair it with `@placeholder` for initial layout stability, `@loading` for spinners, and `@error` for fallbacks. This drastically improves Largest Contentful Paint (LCP) and Initial Bundle Size.',
    spokenTip: '`@defer` gives us declarative component-level code splitting driven by real user viewport and interaction triggers.',
    example: {
      language: 'typescript',
      code: `@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [HeavyChartComponent, ProductReviewsComponent],
  template: \`
    <!-- Modern Control Flow with strict track & type narrowing -->
    @if (product(); as prod) {
      <h1>{{ prod.name }}</h1>
      <p>Price: {{ prod.price | currency }}</p>
    } @else {
      <p>Loading product details...</p>
    }

    <!-- Component-Level Lazy Loading with @defer -->
    @defer (on viewport; prefetch on idle) {
      <app-heavy-chart [data]="analyticsData()" />
    } @placeholder (minimum 300ms) {
      <div class="chart-skeleton">Chart placeholder (Zero JS loaded yet)</div>
    } @loading (after 100ms; minimum 500ms) {
      <div class="spinner">Downloading chart chunk...</div>
    } @error {
      <p class="error">Failed to load analytics chart.</p>
    }
  \`
})
export class ProductPageComponent {
  product = signal<Product | null>(null);
  analyticsData = signal<AnalyticsData | null>(null);
}`,
      explanation: 'Combines @if type narrowing with @defer viewport loading and placeholder skeleton.'
    },
    seniorPoint: '`@placeholder (minimum 300ms)` and `@loading (after 100ms; minimum 500ms)` prevent visual layout thrashing and UI flicker on fast networks by guaranteeing sensible display durations.',
    followUps: [
      {
        question: 'What is the difference between `on viewport` and `prefetch on idle` in `@defer`?',
        answer: '`on viewport` triggers the download and rendering when the element scrolls into view. `prefetch on idle` downloads the JS chunk in the background when the browser is idle, so rendering is instant when scrolled into view.'
      },
      {
        question: 'Can you use `@defer` with components that are not standalone?',
        answer: 'No. `@defer` requires standalone components (or directives/pipes) so the build tool can extract them into independent Webpack/Vite async chunks.'
      }
    ],
    keyPointsToMention: [
      '@if provides seamless TypeScript type narrowing in templates',
      '@for requires track expression (track item.id) to optimize DOM node reuse',
      '@defer automatically creates async chunks for standalone components',
      '@defer sub-blocks: @placeholder, @loading, and @error prevent UI layout shifts'
    ],
    tags: ['angular', 'control-flow', 'defer', 'lazy-loading', 'performance', 'lcp']
  },
  {
    id: 'ng_03',
    category: 'angular',
    topic: 'Change Detection & OnPush',
    difficulty: 'Senior',
    question: 'Contrast Default Change Detection with ChangeDetectionStrategy.OnPush. How does ChangeDetectorRef work, and what triggers an OnPush component update?',
    shortAnswer: 'Default change detection runs top-down through the whole component tree on any async event intercepted by Zone.js. `OnPush` tells Angular to skip checking a component and its subtree unless: 1) an `@Input` reference changes, 2) an event listener inside the component fires, 3) an `async` pipe receives a new emission, 4) a Signal read in the template updates, or 5) `markForCheck()` is called explicitly.',
    interviewAnswer: 'In Default mode, Zone.js triggers change detection globally for any macro or micro task—timers, HTTP calls, or clicks. It checks every single template binding across the app tree, which causes performance bottlenecks at scale.\n\nWith `ChangeDetectionStrategy.OnPush`, Angular checks the component only when:\n1. An `@Input` reference changes by strict equality (`prev !== curr`).\n2. A template event listener bound in that component fires.\n3. An `Observable` bound via the `async` pipe emits.\n4. A `signal()` read in the template updates.\n5. `cdr.markForCheck()` is called manually.\n\n`OnPush` relies on immutability. If you mutate an object or array in place without creating a new reference, Angular will skip checking the child view.',
    spokenTip: 'OnPush turns Angular into an event-driven change detection model, skipping component trees that have unchanged inputs and no events.',
    example: {
      language: 'typescript',
      code: `import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, inject } from '@angular/core';

@Component({
  selector: 'app-user-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="user-row">
      <span>{{ user.name }}</span>
      <span class="status">{{ user.status }}</span>
      <button (click)="refreshLocal()">Refresh</button>
    </div>
  \`
})
export class UserRowComponent {
  @Input({ required: true }) user!: { id: string; name: string; status: string };
  private cdr = inject(ChangeDetectorRef);

  refreshLocal() {
    // Template click event automatically triggers OnPush change detection
  }

  // Called from an external WebSocket outside Angular zone:
  onExternalWebSocketUpdate(newStatus: string) {
    this.user.status = newStatus;
    // Notify Angular that this path to root needs to be checked
    this.cdr.markForCheck();
  }
}`,
      explanation: 'Shows OnPush strategy, template event auto-check, and manual markForCheck() for external async events.'
    },
    seniorPoint: '`markForCheck()` does not immediately run change detection. It marks the component and all its ancestors up to the root as dirty so they are checked in the next CD cycle. In contrast, `detectChanges()` runs change detection immediately on the current component and its children only.',
    followUps: [
      {
        question: 'Why does mutating an array with .push() fail to update an OnPush child component?',
        answer: 'Because `.push()` mutates the existing array in place. The array memory reference remains the same, so the child OnPush component sees `prev === curr` and skips re-rendering.'
      },
      {
        question: 'When would you use `cdr.detach()` and `cdr.reattach()`?',
        answer: 'For high-frequency streaming dashboards (e.g. 500Hz WebSockets) where running CD on every message would freeze the browser. You detach the component and call `detectChanges()` at a controlled interval (e.g. 60fps via requestAnimationFrame).'
      }
    ],
    keyPointsToMention: [
      'Zone.js global dirty checking vs OnPush subtree skipping',
      'Five triggers for OnPush evaluation (Input ref change, template event, async pipe, signals, markForCheck)',
      'markForCheck() marks path to root dirty vs detectChanges() runs local immediate check',
      'Immutability is required for OnPush to detect input changes'
    ],
    tags: ['angular', 'change-detection', 'onpush', 'zonejs', 'cdr', 'performance']
  },
  {
    id: 'ng_04',
    category: 'angular',
    topic: 'Dependency Injection Hierarchy',
    difficulty: 'Senior',
    question: 'How does Angular’s Dependency Injection (DI) injector hierarchy work? Detail providedIn: "root", Element injectors, InjectionToken, and provider types.',
    shortAnswer: 'Angular DI consists of two parallel injector trees: the Environment Injector tree (Root, Platform, Environment) and the Element Injector tree (created per DOM component/directive). Angular resolves tokens by searching up the Element Injector tree first; if not found, it traverses the Environment Injector tree to Root.',
    interviewAnswer: 'Angular\'s DI engine uses a two-tiered hierarchy:\n1. **Element Injector Tree**: Created at DOM nodes for components or directives providing services in `providers: [...]` or `viewProviders: [...]`. These instances are scoped to that component and destroyed when the component unmounts.\n2. **Environment Injector Tree**: Provided at application startup (`app.config.ts`) or via `@Injectable({ providedIn: "root" })`. These are singletons across the entire application and are tree-shakeable.\n\nProvider recipes include:\n- `useClass`: Provides an alternative class (useful for mock implementations in tests).\n- `useValue`: Associates an `InjectionToken` with a static config object.\n- `useFactory`: Runs a factory function with injected dependencies to construct complex objects.\n- `useExisting`: Creates an alias for an existing token.\n- `multi: true`: Collects multiple providers into an array for a single token (like `HTTP_INTERCEPTORS`).\n\nThe modern `inject(TOKEN)` function allows functional dependency injection outside constructors.',
    spokenTip: 'DI resolution starts at the requesting DOM node and bubbles up through parent component injectors before falling back to the Environment/Root injector.',
    example: {
      language: 'typescript',
      code: `import { InjectionToken, Injectable, inject } from '@angular/core';

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
      explanation: 'Defines an InjectionToken with a factory provider and functional inject() usage.'
    },
    seniorPoint: '`providedIn: "root"` is tree-shakeable: if no component imports or injects the service, the bundler removes its code from the production build. If you list the service in an `@NgModule` or `providers: []` array, it cannot be tree-shaken.',
    followUps: [
      {
        question: 'What is the difference between `providers` and `viewProviders` in a component?',
        answer: '`providers` makes the service available to the component and any projected content (`<ng-content>`). `viewProviders` makes the service available only to the component\'s internal view template, hiding it from projected content.'
      },
      {
        question: 'What do resolution modifiers like `@Optional()`, `@Self()`, `@SkipSelf()`, and `@Host()` do?',
        answer: '`@Self()` searches only the current element; `@SkipSelf()` starts searching from the parent element; `@Host()` stops searching at the host component; `@Optional()` returns `null` instead of throwing an error if not found.'
      }
    ],
    keyPointsToMention: [
      'Two injector hierarchies: Element/Node Injectors vs Environment/Root Injectors',
      'Resolution order: Local Element -> Parent Elements -> Environment / Root -> NullInjector (throws error)',
      'Provider recipes: useClass, useValue, useFactory, useExisting, and multi: true',
      'Tree-shakeability of providedIn: "root"'
    ],
    tags: ['angular', 'dependency-injection', 'inject', 'injection-token', 'providers']
  },
  {
    id: 'ng_05',
    category: 'angular',
    topic: 'Reactive & Typed Forms',
    difficulty: 'Senior',
    question: 'How do Strictly Typed Reactive Forms work in modern Angular, and how do you design custom asynchronous validators with debounce and cancellation?',
    shortAnswer: 'Strictly Typed Forms guarantee full compile-time type safety for `FormGroup`, `FormControl`, `FormArray`, and `FormRecord`. Custom async validators return `Observable<ValidationErrors | null>` and should use `timer()` for debouncing and `switchMap()` to cancel in-flight HTTP requests on new keystrokes.',
    interviewAnswer: 'In modern Angular, Reactive Forms are strictly typed. `FormGroup<{ email: FormControl<string>; age: FormControl<number | null> }>` preserves complete type inference across `.value`, `.getRawValue()`, and `.valueChanges`.\n\nWhen writing asynchronous validators (such as verifying if a username is already taken):\n1. The validator returns an `AsyncValidatorFn`: `(control: AbstractControl) => Observable<ValidationErrors | null>`.\n2. We debounce the input using `timer(300)` so we don\'t flood the backend on every character.\n3. We use `switchMap` to trigger the HTTP call, which automatically cancels pending in-flight requests when the user types again.\n4. If taken, we return `{ usernameTaken: true }`; if available, we return `null`.\n5. We add `catchError(() => of(null))` so network errors degrade gracefully without locking the form.',
    spokenTip: 'Use strictly typed forms for compile-time safety, and always debounce and cancel async validators with timer and switchMap.',
    example: {
      language: 'typescript',
      code: `import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export function uniqueUsernameValidator(http: HttpClient): AsyncValidatorFn {
  return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    // Debounce 300ms, then call backend with switchMap cancellation
    return timer(300).pipe(
      switchMap(() => http.get<{ available: boolean }>(\`/api/check-user?username=\${encodeURIComponent(control.value)}\`)),
      map(res => (res.available ? null : { usernameTaken: true })),
      catchError(() => of(null)) // Degrade gracefully on network failure
    );
  };
}

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
      explanation: 'Shows strictly typed FormGroup with nonNullable controls and debounced, cancellable async validator.'
    },
    seniorPoint: '`form.value` excludes values from disabled controls and types their fields as `T | undefined`. Use `form.getRawValue()` when submitting form payloads to ensure disabled controls are included with exact types.',
    followUps: [
      {
        question: 'What is the difference between `FormGroup` and `FormRecord`?',
        answer: '`FormGroup` has a fixed set of known keys defined at compile-time. `FormRecord` is designed for dynamic dictionaries where keys can be added and removed at runtime while sharing the same value type.'
      },
      {
        question: 'When do async validators execute in the form validation lifecycle?',
        answer: 'Async validators only execute after all synchronous validators have passed. If a sync validator (e.g. `Validators.required` or `minLength(3)`) fails, the async validator is not called, saving backend requests.'
      }
    ],
    keyPointsToMention: [
      'Strictly typed FormControl<T> vs FormRecord vs FormArray',
      'getValue() vs getRawValue() (getRawValue includes disabled controls)',
      'Async validator lifecycle: runs only after sync validation passes',
      'Debouncing and cancelling async validator HTTP calls via RxJS timer & switchMap'
    ],
    tags: ['angular', 'forms', 'reactive-forms', 'typed-forms', 'async-validators']
  },
  {
    id: 'ng_06',
    category: 'angular',
    topic: 'HTTP Interceptors & Functional Pipeline',
    difficulty: 'Senior',
    question: 'How do modern Functional HTTP Interceptors work in Angular? How do you implement automated JWT 401 token refresh with request queueing?',
    shortAnswer: 'Functional interceptors (`HttpInterceptorFn`) intercept outgoing requests and incoming responses. To handle 401 Unauthorized errors: catch the 401, check an `isRefreshing` lock, call the refresh token endpoint, cache the new token, update queued requests with the new header via `switchMap`, and retry the original request with `req.clone()`.',
    interviewAnswer: 'In modern Angular, `HttpInterceptorFn` replaces class-based interceptors and is configured via `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`.\n\nTo handle 401 token refresh without race conditions:\n1. We intercept the error using `catchError`.\n2. If a 401 happens and we are not already refreshing, we set an `isRefreshing = true` flag and clear our `refreshTokenSubject`.\n3. We call the auth service refresh token endpoint.\n4. When the new token arrives, we emit it to `refreshTokenSubject`, set `isRefreshing = false`, clone the original request with the new token, and retry it.\n5. If other parallel requests fail with 401 while refresh is in progress, they wait by subscribing to `refreshTokenSubject` until the token is emitted, then clone and retry.',
    spokenTip: 'Functional interceptors wrap HttpClient requests in a middleware pipeline. For 401 refreshes, use a BehaviorSubject queue so parallel requests wait for the new token.',
    example: {
      language: 'typescript',
      code: `import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 error (skip refresh endpoint itself to avoid infinite loops)
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
          // Parallel requests wait for ongoing refresh to emit new token
          return refreshTokenSubject.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap(newToken => next(req.clone({ setHeaders: { Authorization: \`Bearer \${newToken}\` } })))
          );
        }
      }
      return throwError(() => error);
    })
  );
};`,
      explanation: 'Functional interceptor with request cloning, 401 handling, and BehaviorSubject queue for concurrent requests.'
    },
    seniorPoint: '`HttpRequest` objects in Angular are strictly immutable. You cannot mutate properties directly (`req.headers.set(...)` will fail silently or throw). You must always call `req.clone({ setHeaders: { ... } })`.',
    followUps: [
      {
        question: 'Why must we exclude the refresh token URL itself from the 401 interceptor handler?',
        answer: 'If the refresh token itself is expired or invalid, calling the refresh endpoint will return 401. If not excluded, it would trigger another refresh call, causing an infinite loop.'
      },
      {
        question: 'How do you pass metadata to an interceptor to bypass auth for specific requests?',
        answer: 'Use `HttpContext` and `HttpContextToken`. For example, `new HttpContext().set(IS_PUBLIC_API, true)`, and check `req.context.get(IS_PUBLIC_API)` in the interceptor.'
      }
    ],
    keyPointsToMention: [
      'HttpRequest is immutable: must use req.clone({ setHeaders: { ... } })',
      'Functional interceptors configured via provideHttpClient(withInterceptors([]))',
      'Handling concurrent 401 refresh requests using BehaviorSubject queue',
      'Preventing infinite 401 loops by checking refresh URL'
    ],
    tags: ['angular', 'http-client', 'interceptors', 'auth', 'jwt', 'token-refresh']
  },
  {
    id: 'ng_07',
    category: 'angular',
    topic: 'Angular 19 Resource & Async Reactivity',
    difficulty: 'Senior',
    question: 'What is the `resource()` / `rxResource()` API in Angular 19, and how does it replace manual RxJS subscription boilerplate for data fetching?',
    shortAnswer: '`resource()` (and `rxResource()`) is Angular 19’s reactive data-fetching primitive. It accepts a `request` computation (a signal) and a `loader` function that returns a Promise or Observable. When the request signal changes, it automatically re-fetches, cancels previous in-flight requests via `AbortSignal`, and exposes signals for `.value()`, `.isLoading()`, `.status()`, and `.error()`.',
    interviewAnswer: 'In Angular 19, `resource()` bridges signal state and async data fetching. Previously, senior developers wrote custom boilerplate using RxJS `switchMap`, `BehaviorSubject`, and manual loading/error flags.\n\nWith `resource()`:\n1. You define a `request` computation (e.g. reading a search query or pagination signal).\n2. Whenever any signal read inside `request` changes, the `loader` triggers automatically.\n3. The loader receives an `AbortSignal` for native fetch request cancellation.\n4. It exposes reactive signals: `res.value()` (the resolved data), `res.isLoading()` (boolean for spinners), `res.error()`, and `res.status()` (`idle | loading | error | resolved | reloading`).\n5. For RxJS-based services, `rxResource({ request: ..., loader: () => http.get(...) })` integrates directly with HttpClient.',
    spokenTip: 'I describe resource() as Angular’s built-in TanStack Query / React Query alternative for Signals—handling caching, cancellation, and loading states declaratively.',
    example: {
      language: 'typescript',
      code: `import { Component, signal, resource } from '@angular/core';

interface User {
  id: number;
  name: string;
  role: string;
}

@Component({
  selector: 'app-user-search',
  standalone: true,
  template: \`
    <input 
      type="text" 
      [value]="searchTerm()" 
      (input)="onSearch($event)" 
      placeholder="Search user..." 
    />

    @if (userResource.isLoading()) {
      <div class="spinner">Fetching user data...</div>
    }

    @if (userResource.error()) {
      <div class="error">Failed to load user.</div>
    }

    @if (userResource.value(); as user) {
      <div class="user-card">
        <h4>{{ user.name }}</h4>
        <p>Role: {{ user.role }}</p>
      </div>
    }
  \`
})
export class UserSearchComponent {
  searchTerm = signal<string>('alice');

  // Declarative async resource with automatic request cancellation
  userResource = resource<User, { query: string }>({
    request: () => ({ query: this.searchTerm() }),
    loader: async ({ request, abortSignal }) => {
      const response = await fetch(\`/api/users?q=\${encodeURIComponent(request.query)}\`, {
        signal: abortSignal
      });
      if (!response.ok) throw new Error('User not found');
      return response.json();
    }
  });

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }
}`,
      explanation: 'Uses Angular 19 resource() with reactive params, automatic fetch cancellation via abortSignal, and declarative status signals.'
    },
    seniorPoint: '`resource()` automatically handles race conditions. If the user types "a" then "ab" rapidly, the loader for "a" is aborted via `abortSignal`, preventing stale data from overwriting newer search results.',
    followUps: [
      {
        question: 'How do you manually trigger a re-fetch on a resource without changing its request signals?',
        answer: 'Call `userResource.reload()`. This re-executes the loader with the current request parameters.'
      },
      {
        question: 'Can you write to a resource directly?',
        answer: 'Yes, resources provide `.set()` and `.update()` methods to optimistically update local UI state before the server responds.'
      }
    ],
    keyPointsToMention: [
      'Declarative async data fetching linked to signal changes',
      'Exposes .value(), .isLoading(), .error(), and .status() signals',
      'Native AbortSignal support eliminates stale response race conditions',
      'rxResource() variant for seamless RxJS HttpClient integration'
    ],
    tags: ['angular', 'angular19', 'signals', 'resource', 'rxResource', 'async-reactivity']
  },
  {
    id: 'ng_08',
    category: 'angular',
    topic: 'Directive Composition & HostDirectives API',
    difficulty: 'Senior',
    question: 'How does the Directive Composition API (`hostDirectives`) work in modern Angular, and how does it replace multi-inheritance and mixins?',
    shortAnswer: '`hostDirectives` allows components or other directives to compose multiple standalone directives onto their host element at compile time. It supports exposing and aliasing the inputs and outputs of the composed host directives, enabling modular code reuse without class inheritance.',
    interviewAnswer: 'Before Angular 15, sharing behavior like tooltip, keyboard accessibility, or ripple effects required either classical TypeScript inheritance (which is limited to single inheritance and tight coupling) or attaching multiple directives manually in HTML templates.\n\nWith `hostDirectives: [TooltipDirective, { directive: CdkTrapFocus, inputs: [\'cdkTrapFocus: trapFocus\'] }]`, Angular applies directives directly to the component\'s host element. The host component can selectively expose inputs and outputs from the host directives to its own public API, or map them with custom aliases. This delivers true composition over inheritance.',
    spokenTip: '`hostDirectives` lets us compose behaviors like Tooltips, ClickOutside, or FocusTraps onto a component declaratively without class inheritance.',
    example: {
      language: 'typescript',
      code: `import { Directive, Component, ElementRef, inject, input } from '@angular/core';

// 1. Standalone Reusable Directive
@Directive({
  selector: '[appRipple]',
  standalone: true,
  host: {
    '(click)': 'createRipple($event)',
    '[class.has-ripple]': 'true'
  }
})
export class RippleDirective {
  rippleColor = input<string>('rgba(255,255,255,0.4)');
  createRipple(event: MouseEvent) {
    // DOM ripple logic...
  }
}

// 2. Component Composing the Directive via hostDirectives
@Component({
  selector: 'app-primary-button',
  standalone: true,
  template: \`<button class="btn"><ng-content /></button>\`,
  // Host Directives Composition
  hostDirectives: [
    {
      directive: RippleDirective,
      inputs: ['rippleColor: color'] // Expose rippleColor as 'color' on this button
    }
  ]
})
export class PrimaryButtonComponent {}`,
      explanation: 'Demonstrates composing a standalone RippleDirective onto PrimaryButtonComponent while aliasing its input property.'
    },
    seniorPoint: 'Host directives must be `standalone: true`. They participate in the host element\'s Dependency Injection and Lifecycle hooks (`ngOnInit`, `ngOnDestroy`), running before the host component\'s lifecycle hooks.',
    followUps: [
      {
        question: 'Can a directive have its own hostDirectives?',
        answer: 'Yes, directives can compose other directives recursively to build composite behaviors (e.g. `ValidatableFieldDirective` composing `FocusDirective` and `AriaDescribedByDirective`).'
      },
      {
        question: 'Can hostDirectives be added dynamically at runtime?',
        answer: 'No, hostDirectives must be defined statically in the `@Component` or `@Directive` decorator metadata for ahead-of-time compiler optimization.'
      }
    ],
    keyPointsToMention: [
      'Composition over inheritance for behavior reuse',
      'hostDirectives array in decorator metadata',
      'Exposing and aliasing inputs/outputs of composed directives',
      'Host directives run their lifecycle hooks before the host component'
    ],
    tags: ['angular', 'directives', 'hostDirectives', 'composition-api', 'architecture']
  },
  {
    id: 'ng_09',
    category: 'angular',
    topic: 'ViewEncapsulation & Modern Styling',
    difficulty: 'Senior',
    question: 'Explain ViewEncapsulation modes (`Emulated`, `None`, `ShadowDom`), CSS `:host`, and how to style third-party child components without deprecated `::ng-deep`.',
    shortAnswer: '`Emulated` (default) scopes CSS by adding unique `_ngcontent-xxx` host attributes. `None` injects styles globally. `ShadowDom` uses native browser Shadow DOM. Because `::ng-deep` is deprecated, modern approaches use CSS Custom Properties (Variables), global utility classes in `styles.scss`, or `:host` context selectors.',
    interviewAnswer: 'Angular provides 3 `ViewEncapsulation` modes:\n1. `Emulated` (default): Angular modifies component CSS selectors at build time by appending unique attribute selectors (e.g. `button[_ngcontent-c1]`). It prevents component styles from leaking out, but does not block outer global styles from entering.\n2. `None`: Component styles are injected into `<head>` as global CSS.\n3. `ShadowDom`: Uses the browser\'s native Shadow DOM, offering true isolation for styles and DOM events.\n\nFor targeting third-party child components (like Angular Material or PrimeNG) without deprecated `::ng-deep`:\n- Expose and override **CSS Custom Properties** (variables) on `:host` (e.g. `:host { --mdc-theme-primary: #6366f1; }`).\n- Use a targeted global stylesheet with scoped container classes (e.g. `.custom-theme .mat-mdc-dialog-container`).',
    spokenTip: 'Never rely on `::ng-deep` in new code; use CSS Custom Properties or parent scoped classes in global stylesheets.',
    example: {
      language: 'typescript',
      code: `import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-user-profile-badge',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: \`
    <div class="badge-card">
      <span class="user-name">Alice Smith</span>
    </div>
  \`,
  styles: [\`
    /* Target the component host element itself */
    :host {
      display: block;
      --badge-bg: #1e293b;
      --badge-color: #f8fafc;
    }

    /* Target host when a specific class is present */
    :host(.active) {
      --badge-bg: #4f46e5;
    }

    .badge-card {
      background: var(--badge-bg);
      color: var(--badge-color);
      padding: 1rem;
      border-radius: 0.5rem;
    }
  \`]
})
export class UserProfileBadgeComponent {}`,
      explanation: 'Illustrates proper :host styling and CSS custom properties pattern for clean, leak-free encapsulation.'
    },
    seniorPoint: '`ViewEncapsulation.ShadowDom` creates true CSS boundaries and stops CSS inheritance (except for custom properties and inheritable font properties). However, it requires all shared global CSS resets to be imported inside each shadow root.',
    followUps: [
      {
        question: 'What is the difference between `:host` and `:host-context()`?',
        answer: '`:host` styles the component element itself. `:host-context(.dark-theme)` styles the host element only if an ancestor in the DOM tree matches the selector `.dark-theme`.'
      },
      {
        question: 'Why was `::ng-deep` deprecated by browser vendors and the Angular team?',
        answer: '`::ng-deep` was based on the obsolete shadow-piercing `/deep/` CSS spec that was dropped by browser vendors because it breaks style encapsulation and slows down CSS engine parsing.'
      }
    ],
    keyPointsToMention: [
      'Emulated (attribute scoping) vs None (global) vs ShadowDom (native isolation)',
      ':host and :host-context() selectors',
      'Avoiding ::ng-deep via CSS Custom Properties and scoped global classes',
      'ShadowDom boundary behavior regarding styles and event bubbling'
    ],
    tags: ['angular', 'css', 'view-encapsulation', 'styling', 'shadow-dom']
  },
  {
    id: 'ng_10',
    category: 'angular',
    topic: 'Memory Leak Prevention & DestroyRef',
    difficulty: 'Senior',
    question: 'What are the most common memory leaks in Angular applications, and how do `DestroyRef` and `takeUntilDestroyed` solve unsubscription issues?',
    shortAnswer: 'Common leaks: uncancelled RxJS subscriptions to long-lived Observables (Router/NgRx/interval), uncleaned `addEventListener` / `ResizeObserver` instances, and stale object references in singleton services. `takeUntilDestroyed()` automatically binds Observable lifecycles to the active injection context without requiring boilerplate `Subject.next()` in `ngOnDestroy`.',
    interviewAnswer: 'Memory leaks in single-page Angular apps usually stem from:\n1. **Uncompleted Subscriptions**: Subscribing to global streams (`router.events`, NgRx Store, `interval()`, `fromEvent()`) inside a component without unsubscribing when the component is destroyed. The component instance stays pinned in memory.\n2. **Manual DOM Listeners**: Attaching `window.addEventListener` or `IntersectionObserver` / `ResizeObserver` without calling `disconnect()` / `removeEventListener()` in teardown.\n3. **Service Retaining State**: Storing component callbacks or large arrays inside a root singleton service without clearing them.\n\nIn modern Angular, `takeUntilDestroyed()` (used in constructor or with an explicit `DestroyRef`) binds an Observable stream directly to the component\'s lifecycle. For manual teardowns, `inject(DestroyRef).onDestroy(() => cleanup())` runs cleanup code without implementing `OnDestroy`.',
    spokenTip: 'I use `takeUntilDestroyed()` for all component streams and `DestroyRef.onDestroy()` for cleaning up native observers and timeouts.',
    example: {
      language: 'typescript',
      code: `import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-live-telemetry',
  standalone: true,
  template: \`<p>Telemetry Polling Active</p>\`
})
export class LiveTelemetryComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private resizeObserver?: ResizeObserver;

  constructor() {
    // 1. Automatically infers current InjectionContext & DestroyRef
    interval(2000).pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.pollTelemetry();
    });
  }

  ngOnInit() {
    // 2. Cleaning up non-RxJS native browser APIs using DestroyRef
    this.resizeObserver = new ResizeObserver(entries => {
      console.log('Resized:', entries);
    });
    this.resizeObserver.observe(document.body);

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      console.log('Cleaned up ResizeObserver on destroy');
    });
  }

  private pollTelemetry() {
    // Poll API...
  }
}`,
      explanation: 'Demonstrates takeUntilDestroyed() in injection context and DestroyRef.onDestroy for cleaning up ResizeObserver.'
    },
    seniorPoint: 'Calling `takeUntilDestroyed()` outside of an injection context (e.g. inside `ngOnInit`) without passing `destroyRef` explicitly (`takeUntilDestroyed(this.destroyRef)`) will throw a runtime error.',
    followUps: [
      {
        question: 'Do HttpClient requests (`http.get(...)`) need to be unsubscribed to prevent memory leaks?',
        answer: 'HttpClient requests complete automatically after a single emission and clean up their subscriptions. However, unsubscribing via `takeUntilDestroyed()` is still recommended to cancel in-flight HTTP requests if the user navigates away.'
      },
      {
        question: 'What is the advantage of DestroyRef over the traditional ngOnDestroy lifecycle hook?',
        answer: '`DestroyRef` can be injected anywhere in reusable composable functions and services without forcing component classes to implement `OnDestroy` and write boilerplate.'
      }
    ],
    keyPointsToMention: [
      'takeUntilDestroyed() for declarative Observable unsubscription',
      'DestroyRef.onDestroy() for custom teardown (DOM listeners, Observers, timers)',
      'Injection context requirement for takeUntilDestroyed() without arguments',
      'Distinguishing auto-completing streams (HttpClient) from infinite streams (Router/Store/interval)'
    ],
    tags: ['angular', 'memory-leaks', 'destroyRef', 'takeUntilDestroyed', 'rxjs', 'performance']
  },
  {
    id: 'ng_11',
    category: 'angular',
    topic: 'Router Guards & Component Input Binding',
    difficulty: 'Senior',
    question: 'How do modern Functional Router Guards (`CanActivateFn`, `CanMatchFn`) work, and what is `withComponentInputBinding()`?',
    shortAnswer: 'Functional router guards (`CanActivateFn`, `CanMatchFn`) are functions that return boolean, `UrlTree`, Promise, or Observable. `CanMatchFn` runs before route downloading, enabling conditional bundle loading. `withComponentInputBinding()` automatically binds route parameters, query params, and resolved route data directly to component `input()` signals.',
    interviewAnswer: 'In modern Angular routing:\n1. **Functional Guards**: Replace class-based guards. `CanActivateFn` checks if a matched route can be activated. `CanMatchFn` checks whether the route definition matches in the first place—if it returns false, the router skips this route and continues searching (ideal for A/B testing or loading completely different bundles for Admin vs User on the same path `/dashboard`).\n2. **Return UrlTree**: Guards should return a `UrlTree` (via `inject(Router).createUrlTree([\'/login\'])`) instead of `false` to redirect cleanly without URL flickering.\n3. **`withComponentInputBinding()`**: Configured in `provideRouter(routes, withComponentInputBinding())`. It automatically passes route path params (`:id`), query params (`?filter=active`), and resolve data into `@Input()` or `input()` signals on the routed component, removing boilerplate `ActivatedRoute.snapshot` code.',
    spokenTip: 'Use `CanMatch` to prevent unauthorized bundle downloading, return `UrlTree` for clean redirects, and enable `withComponentInputBinding` to eliminate ActivatedRoute subscription boilerplate.',
    example: {
      language: 'typescript',
      code: `import { Routes, CanActivateFn, Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { inject, Component, input } from '@angular/core';
import { AuthService } from './auth.service';

// 1. Functional Auth Guard returning UrlTree
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  // Redirect to login with returnUrl query parameter
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// 2. Component with Router Input Binding
@Component({
  selector: 'app-order-detail',
  standalone: true,
  template: \`
    <h2>Order ID: {{ id() }}</h2>
    <p>Filter Mode: {{ filter() }}</p>
  \`
})
export class OrderDetailComponent {
  // Automatically bound from path parameter /orders/:id
  id = input.required<string>();
  // Automatically bound from query parameter ?filter=...
  filter = input<string>('all');
}

// 3. Standalone Route Configuration
export const routes: Routes = [
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./order-detail.component').then(m => m.OrderDetailComponent)
  }
];`,
      explanation: 'Demonstrates functional auth guard returning UrlTree, lazy loadComponent, and automatic route input binding.'
    },
    seniorPoint: '`CanMatchFn` executes before route code splitting bundles are fetched over the network. If a user is not authorized, `CanMatch` prevents the lazy-loaded JS chunk from being downloaded at all, enhancing security and bandwidth.',
    followUps: [
      {
        question: 'What is the purpose of `CanDeactivateFn` in Angular forms?',
        answer: 'It checks if a user has unsaved form changes before navigating away and prompts a confirmation dialog to prevent accidental data loss.'
      },
      {
        question: 'How do you handle route resolver errors without crashing the route transition?',
        answer: 'Use `catchError` in the resolver Observable and return `EMPTY` or a fallback `UrlTree` to redirect to an error page.'
      }
    ],
    keyPointsToMention: [
      'Functional guards (CanActivateFn, CanMatchFn, CanDeactivateFn)',
      'Returning UrlTree instead of boolean false for atomic redirects',
      'CanMatch prevents lazy chunk downloading for unauthorized users',
      'withComponentInputBinding maps path & query params directly to component inputs'
    ],
    tags: ['angular', 'router', 'guards', 'canActivate', 'canMatch', 'input-binding']
  },
  {
    id: 'ng_12',
    category: 'angular',
    topic: 'Content Projection & Dynamic Components',
    difficulty: 'Senior',
    question: 'How does Multi-slot Content Projection (`<ng-content>`) work with `ngProjectAs`, and when should you choose dynamic component instantiation (`ViewContainerRef.createComponent()`) instead?',
    shortAnswer: '`<ng-content select="...">` projects caller-provided template nodes into designated component slots. `ngProjectAs` forces projected elements to match custom CSS selectors. Use `ng-content` for declarative structural layout composition (Card headers/footers), and `ViewContainerRef.createComponent()` for programmatic, dynamic runtime components (Modals, Toasts, Dynamic Dashboards).',
    interviewAnswer: 'Angular offers two distinct ways to compose UI elements:\n1. **Content Projection (`<ng-content>`)**: Declarative and template-driven. By adding `select="[card-header]"` or `select="app-icon"`, we create multi-slot components (e.g. Card with Header, Body, and Actions). If a wrapper element like `<ng-container>` contains content, we use `ngProjectAs="[card-header]"` so Angular treats it as the targeted slot.\n\n2. **Dynamic Component Instantiation (`ViewContainerRef.createComponent`)**: Programmatic and imperative. Used when components must be created on-demand based on runtime events, like Toast notifications, Modals, or dynamic CMS widgets. We inject `ViewContainerRef`, call `.createComponent(MyComponent)`, configure its inputs via `.setInput(name, value)`, and subscribe to its outputs.',
    spokenTip: 'Content projection is for declarative component templates; ViewContainerRef is for programmatic runtime components like Dialogs and Toasts.',
    example: {
      language: 'typescript',
      code: `import { Component, ViewChild, ViewContainerRef, inject } from '@angular/core';

// 1. Multi-slot Projected Card Component
@Component({
  selector: 'app-dialog-card',
  standalone: true,
  template: \`
    <div class="card">
      <header class="header">
        <ng-content select="[dialog-header]" />
      </header>
      <section class="body">
        <ng-content /> <!-- Default slot -->
      </section>
      <footer class="footer">
        <ng-content select="[dialog-actions]" />
      </footer>
    </div>
  \`
})
export class DialogCardComponent {}

// 2. Dynamic Component Host Factory
@Component({
  selector: 'app-toast-manager',
  standalone: true,
  template: \`<ng-container #toastHost />\`
})
export class ToastManagerComponent {
  @ViewChild('toastHost', { read: ViewContainerRef, static: true }) 
  toastHost!: ViewContainerRef;

  showToast(message: string, type: 'info' | 'error') {
    // Dynamic runtime instantiation
    const ref = this.toastHost.createComponent(ToastComponent);
    ref.setInput('message', message);
    ref.setInput('type', type);
    ref.instance.closed.subscribe(() => ref.destroy());
  }
}`,
      explanation: 'Contrasts multi-slot content projection using select attribute with programmatic ViewContainerRef component creation.'
    },
    seniorPoint: 'Content inside `<ng-content>` is always instantiated by Angular in the parent component\'s lifecycle and context, even if the child component hides it using `@if`. If you want deferred instantiation, project an `<ng-template>` with `TemplateRef` instead.',
    followUps: [
      {
        question: 'Why does `<ng-content>` run parent lifecycle hooks even if the child component never displays it?',
        answer: 'Because projected nodes belong to the parent component template. To avoid creating heavy child DOM nodes until needed, pass an `<ng-template>` and render it conditionally with `*ngTemplateOutlet`.'
      },
      {
        question: 'How do you pass a custom Injector when dynamically creating a component?',
        answer: 'Pass `{ injector: customInjector }` in the options object of `viewContainerRef.createComponent(Component, { injector })`.'
      }
    ],
    keyPointsToMention: [
      'Multi-slot projection using <ng-content select="selector">',
      'ngProjectAs for projecting wrapped elements into specific slots',
      'ViewContainerRef.createComponent() for dynamic programmatic UI (Modals/Toasts)',
      'TemplateRef + ngTemplateOutlet for deferred, on-demand content evaluation'
    ],
    tags: ['angular', 'content-projection', 'ng-content', 'ngProjectAs', 'dynamic-components']
  }
];
