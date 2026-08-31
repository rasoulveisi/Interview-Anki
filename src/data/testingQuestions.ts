import { Question } from '../types';

export const testingQuestions: Question[] = [
  {
    id: 'test_01',
    category: 'testing',
    topic: 'Angular Unit Testing & TestBed',
    difficulty: 'Senior',
    question: 'How do you unit test Angular components and services? Compare ComponentFixture, HttpTestingController, fakeAsync/tick(), and waitForAsync().',
    shortAnswer: '`TestBed` configures the test module. `ComponentFixture` controls component lifecycle, debugging DOM nodes (`debugElement.query`), and triggering change detection (`fixture.detectChanges()`). `HttpTestingController` mocks and asserts HTTP requests. `fakeAsync` runs async operations synchronously using a virtual clock controlled by `tick(ms)`. `waitForAsync` wraps real async promises using Zone.js.',
    interviewAnswer: 'Testing in Angular relies on structured test harnesses:\n1. **`TestBed` & `ComponentFixture`**: `TestBed.configureTestingModule()` sets up isolated dependencies. `fixture = TestBed.createComponent(MyComponent)` creates the fixture. `fixture.detectChanges()` manually runs change detection. `fixture.debugElement.query(By.css(".btn"))` inspects DOM nodes.\n2. **`HttpTestingController`**: Injects mock HTTP backends. We assert pending requests (`httpMock.expectOne("/api/users")`), verify method (`req.request.method === "GET"`), and provide mock responses via `req.flush(mockData)`.\n3. **Asynchronous Testing (`fakeAsync` vs `waitForAsync`)**:\n   - **`fakeAsync` & `tick(ms)` (Preferred)**: Runs code inside a FakeAsyncZone. Timers (`setTimeout`, `debounceTime`) are paused and advanced synchronously using `tick(300)`, making tests deterministic and fast without real time delays.\n   - **`waitForAsync`**: Runs real asynchronous operations and waits until all pending microtasks/promises have resolved before completing the test.',
    spokenTip: 'I prefer fakeAsync with tick() because it simulates time synchronously, eliminating flaky setTimeout delays in unit tests.',
    example: {
      language: 'typescript',
      code: `import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserSearchComponent } from './user-search.component';

describe('UserSearchComponent', () => {
  let component: UserSearchComponent;
  let fixture: ComponentFixture<UserSearchComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserSearchComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no unhandled HTTP requests remain
  });

  it('should debounce input and fetch search results', fakeAsync(() => {
    component.searchControl.setValue('Angular');
    
    // Fast-forward virtual clock by 300ms (debounceTime)
    tick(300);

    const req = httpMock.expectOne('/api/search?q=Angular');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', name: 'Angular 18' }]);

    // Synchronously resolve response and run change detection
    fixture.detectChanges();

    expect(component.results().length).toBe(1);
    expect(component.results()[0].name).toBe('Angular 18');
  }));
});`,
      explanation: 'Unit test demonstrating TestBed, HttpTestingController request flushing, and fakeAsync/tick virtual clock advancement.'
    },
    seniorPoint: 'Always call `httpMock.verify()` in `afterEach()`. This guarantees that if a component unexpectedly makes extra or duplicate HTTP requests, the test suite will fail and alert you.',
    followUps: [
      {
        question: 'What is the difference between `tick()` and `flush()` in `fakeAsync`?',
        answer: '`tick(ms)` advances the virtual clock by a specific number of milliseconds. `flush()` immediately advances the clock until all pending macrotasks and timers in the queue have completed.'
      },
      {
        question: 'Why should unit tests mock child components and third-party dependencies?',
        answer: 'To isolate the component under test, keep execution speeds sub-second, and prevent failures in child components from causing false negatives in parent tests.'
      }
    ],
    keyPointsToMention: [
      'TestBed for dependency injection configuration and component compilation',
      'ComponentFixture for DOM queries and manual change detection triggering',
      'HttpTestingController for mocking HTTP requests (expectOne, flush, verify)',
      'fakeAsync and tick() for deterministic synchronous timer testing'
    ],
    tags: ['testing', 'angular', 'unit-testing', 'testbed', 'fakeasync', 'httptestingcontroller']
  },
  {
    id: 'test_02',
    category: 'testing',
    topic: 'Testing Signals & RxJS Marbles',
    difficulty: 'Senior',
    question: 'How do you test Angular Signals and computed dependencies? How does RxJS Marble Testing work using TestScheduler?',
    shortAnswer: 'Signals update synchronously, making them simple to test by mutating writable signals and asserting `computed()` return values directly. **RxJS Marble Testing** uses ASCII marble diagrams (e.g. `"-a-b-c-|"`) inside a `TestScheduler` to test time-based stream emissions, debounces, and race conditions deterministically.',
    interviewAnswer: 'Testing modern reactive state:\n1. **Testing Angular Signals**: Because Signals are synchronous values, testing is straightforward: mutate the signal via `.set()` or `.update()` and immediately assert the `computed()` signal value without needing async wrappers or `fixture.detectChanges()`. For `effect()`, use `TestBed.flushEffects()` to run scheduled effects synchronously in the test environment.\n2. **RxJS Marble Testing (`TestScheduler`)**:\n   - Uses visual string diagrams where `-` represents 1 frame of virtual time, alphanumeric chars (`a`, `b`) represent emitted values, `|` represents completion, and `#` represents errors.\n   - Inside `testScheduler.run(({ cold, hot, expectObservable }) => { ... })`, we define input streams and assert that output streams match the exact frame-by-frame diagram, guaranteeing that debounces, throttles, and combination operators behave properly across virtual time.',
    spokenTip: 'Signals test synchronously with direct assertions; time-dependent RxJS streams test with TestScheduler marble diagrams.',
    example: {
      language: 'typescript',
      code: `// 1. Synchronous Signal Testing
describe('CartStore Signal', () => {
  it('should recalculate total price when items are added', () => {
    const store = new CartStore();
    expect(store.totalPrice()).toBe(0);

    store.addItem({ id: '1', price: 50 });
    // Computed signals update immediately without async waiting!
    expect(store.totalPrice()).toBe(50);
  });
});

// 2. RxJS Marble Testing with TestScheduler
import { TestScheduler } from 'rxjs/testing';

describe('RxJS Marble Test', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should debounce values by 20ms (2 dashes)', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('-a--b---c---|', { a: 'x', b: 'y', c: 'z' });
      const expected =    '---a--b---c-|'; // After 20ms debounce
      // expectObservable(source$.pipe(debounceTime(20, scheduler))).toBe(expected);
    });
  });
});`,
      explanation: 'Shows synchronous Signal testing alongside RxJS TestScheduler marble diagram testing.'
    },
    seniorPoint: '`TestBed.flushEffects()` is required when testing `effect()` in Angular because effects are scheduled asynchronously by the runtime microtask queue. Calling `flushEffects()` executes pending effects immediately.',
    followUps: [
      {
        question: 'What is the difference between `hot` and `cold` observables in marble testing?',
        answer: '`cold` observables start emitting from frame 0 when subscribed to. `hot` observables emit values according to the global timeline regardless of when subscriptions occur (simulating user click events or subjects).'
      },
      {
        question: 'How do you test `toSignal()` in an Angular unit test?',
        answer: 'Wrap the component or service instantiation inside an injection context (via `TestBed.runInInjectionContext(() => toSignal(source$))`) so `toSignal` can access the `DestroyRef`.'
      }
    ],
    keyPointsToMention: [
      'Synchronous nature of signal() and computed() assertions',
      'TestBed.flushEffects() for testing effects',
      'RxJS Marble syntax: - for time frame, letters for values, | for completion, # for error',
      'TestScheduler run() helper for virtual time execution'
    ],
    tags: ['testing', 'signals', 'rxjs', 'marble-testing', 'testscheduler', 'reactivity']
  },
  {
    id: 'test_03',
    category: 'testing',
    topic: 'E2E Testing & Playwright vs Cypress',
    difficulty: 'Senior',
    question: 'How do Playwright and Cypress compare for modern frontend End-to-End (E2E) testing? Explain the Page Object Model (POM) and network interception.',
    shortAnswer: 'Playwright runs out-of-process via Chrome DevTools Protocol / WebKit / Firefox with native multi-tab, multi-origin, and parallel execution. Cypress runs in-browser in an iframe. **Page Object Model (POM)** encapsulates page selectors and user actions into reusable classes. Network interception (`page.route()`) allows mocking backend APIs or validating payload requests.',
    interviewAnswer: 'For modern end-to-end and component integration testing:\n- **Playwright (Industry Standard)**: Communicates directly with browser rendering engines using WebSocket protocols out-of-process. It supports multi-tab workflows, multiple user contexts (testing two users collaborating in real time), Safari WebKit on Linux CI, auto-waiting on elements, and fast parallel test execution.\n- **Cypress**: Runs inside a single browser tab iframe. Great developer experience, but has architectural limitations with multi-tab flows, iframes, and multiple origins.\n- **Page Object Model (POM)**: We abstract UI selectors and user flows into dedicated classes (e.g. `LoginPage`, `CheckoutPage`). When UI markup or test IDs change, we only update the Page Object class rather than editing 50 separate test files.\n- **Network Interception**: Using `page.route("**/*api/checkout", route => route.fulfill({ status: 200 }))` allows deterministic E2E testing of edge cases (e.g. payment failure 500s) without touching real production payment gateways.',
    spokenTip: 'Playwright is the modern standard for fast, parallel multi-tab E2E tests, structured with the Page Object Model.',
    example: {
      language: 'typescript',
      code: `// Page Object Model (POM) with Playwright
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly payButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.payButton = page.getByRole('button', { name: 'Complete Payment' });
    this.successMessage = page.getByTestId('order-confirmation');
  }

  async submitPayment() {
    await this.payButton.click();
  }
}

// Playwright E2E Test with Network Mocking
import { test } from '@playwright/test';

test('completes checkout successfully', async ({ page }) => {
  // Mock Payment API response
  await page.route('**/api/v1/payments', async (route) => {
    await route.fulfill({ status: 200, json: { orderId: 'ORD-1234', success: true } });
  });

  const checkout = new CheckoutPage(page);
  await page.goto('/checkout');
  await checkout.submitPayment();

  await expect(checkout.successMessage).toBeVisible();
});`,
      explanation: 'Demonstrates Playwright Page Object Model class and network mocking via page.route.'
    },
    seniorPoint: 'Prioritize testing user-facing accessibility locators (`page.getByRole(\'button\', { name: \'Submit\' })` or `page.getByLabel()`) over fragile CSS class selectors. If a refactor breaks accessibility, the test fails, keeping accessibility high.',
    followUps: [
      {
        question: 'What is the Testing Trophy philosophy (Kent C. Dodds)?',
        answer: 'Focus the bulk of testing effort on Integration Tests (testing several units working together), supported by Unit tests for complex business math and high-level E2E smoke tests for critical user flows.'
      },
      {
        question: 'How do you handle flaky E2E tests caused by network latency?',
        answer: 'Use Playwright\'s built-in auto-waiting assertions (`expect(locator).toBeVisible()`) rather than arbitrary `page.waitForTimeout(3000)` sleeps.'
      }
    ],
    keyPointsToMention: [
      'Playwright advantages: out-of-process architecture, multi-tab/multi-user support, fast parallel execution',
      'Page Object Model (POM) design pattern for maintainable tests',
      'Accessible locator strategy: getByRole, getByLabel, getByText over CSS classes',
      'Network mocking and fault injection via page.route()'
    ],
    tags: ['testing', 'playwright', 'cypress', 'e2e', 'page-object-model', 'qa']
  }
];
