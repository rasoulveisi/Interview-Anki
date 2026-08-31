import { Question } from '../types';

export const testingQuestions: Question[] = [
  {
    id: 'test_01',
    category: 'testing',
    topic: 'Angular Unit Testing & HttpTestingController',
    difficulty: 'Senior',
    question: 'How do you write isolated, resilient Angular component & service unit tests using `TestBed` and `HttpTestingController`? Explain `fakeAsync`, `tick`, and why over-mocking is an anti-pattern.',
    shortAnswer: 'Unit tests should test component behavior through public API and DOM events, not internal private implementation details. `HttpTestingController` intercepts HTTP calls and allows asserting request URLs, methods, headers, and flushing mock response data. `fakeAsync` and `tick(ms)` simulate the passage of time synchronously without actual timer delays.',
    seniorPoint: 'Over-mocking (mocking every sub-function, child component, and DOM interaction) results in brittle tests that pass when the system is broken and fail when code is refactored. Test behavior and contracts, not implementation details.',
    spokenTip: 'Test what the user sees and what the component emits, mocking only external I/O boundaries like HTTP.',
    interviewAnswer: 'In modern Angular testing (using Vitest or Jest/Karma):\n1. **`TestBed`**: Configures an isolated testing module declaring the component under test and providing mock implementations for external services.\n2. **`HttpTestingController`**: Used in service tests to assert that an HTTP call was dispatched (`httpMock.expectOne("/api/users")`), verify request properties, and simulate responses with `req.flush(mockUsers)` or errors with `req.error()`.\n3. **Async Handling (`fakeAsync` & `tick`)**: `fakeAsync` wraps the test in a fake Zone. Calling `tick(500)` synchronously advances the virtual clock by 500ms, letting you test debounce timers or delays instantly.\n4. **Avoiding Over-Mocking**: Prefer shallow component testing or testing integration between parent and child components over mock-heavy setups.',
    keyPointsToMention: [
      'TestBed configuration with provideHttpClientTesting()',
      'HttpTestingController: expectOne(), req.flush(), req.error(), and httpMock.verify()',
      'fakeAsync & tick() for synchronous timer and debounce simulation',
      'Pitfalls of testing private state instead of DOM behavior and public outputs'
    ],
    whatInterviewersLookFor: [
      'Verification step: always calling httpMock.verify() in afterEach to catch unasserted HTTP calls',
      'Understanding of synchronous time simulation with fakeAsync'
    ],
    codeExample: `import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no open/unexpected HTTP requests remain
  });

  it('should fetch user list and return mapped domain models', () => {
    const mockData = [{ id: '1', name: 'Alice' }];

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('Alice');
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockData); // Flushes response synchronously
  });
});`,
    tags: ['testing', 'angular-testing', 'testbed', 'httptestingcontroller', 'fakeasync', 'unit-tests']
  },
  {
    id: 'test_02',
    category: 'testing',
    topic: 'Testing Signals & Reactive Streams',
    difficulty: 'Senior',
    question: 'How do you unit test modern Angular Signals (`signal()`, `computed()`, `effect()`) and RxJS Observables (Marble Testing vs Subscribe asserts)?',
    shortAnswer: 'Testing Signals is straightforward and synchronous: initialize the signal, invoke methods/actions, and assert the signal or computed value directly with `expect(store.filteredTodos()).toEqual(...)`. For RxJS Observables, use marble testing (`TestScheduler`) for complex multi-stream timing/debounce scenarios, or use standard `firstValueFrom()` / subscribe callbacks for simple streams.',
    seniorPoint: 'Testing `effect()` requires an active `TestBed` injection context or `TestBed.flushEffects()` because signals batch effect execution asynchronously on microtask ticks.',
    spokenTip: 'Signals simplify testing because they are synchronous value containers that eliminate complex async test setup.',
    interviewAnswer: '1. **Testing Signals & Computed**: Since Signals are synchronous functions, you don\'t need `async/await` or `fakeAsync` for computed state. You simply invoke the signal getter `expect(mySignal()).toBe(expectedValue)` after modifying inputs.\n2. **Testing Effects**: Because `effect()` runs on microtask/CD scheduling, we call `TestBed.flushEffects()` in Angular 17+ to force pending effects to run synchronously.\n3. **RxJS Marble Testing**: Uses ASCII diagrams (e.g. `"--a--b---|"` for emissions, `"-#"` for errors) with `TestScheduler` to test time-based operators (`debounceTime`, `retry`, `throttleTime`) with deterministic virtual frames.',
    keyPointsToMention: [
      'Synchronous nature of signal() and computed() makes them trivial to test',
      'Flushing effects synchronously using TestBed.flushEffects()',
      'Marble testing syntax for time-based RxJS operators',
      'Using firstValueFrom() in async/await test runners'
    ],
    whatInterviewersLookFor: [
      'Contrast between testing asynchronous RxJS streams vs synchronous Signals',
      'Knowledge of TestBed.flushEffects()'
    ],
    codeExample: `import { TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';

describe('Signal Calculation Logic', () => {
  it('should synchronously update computed multiplier', () => {
    const count = signal(2);
    const multiplier = signal(3);
    const total = computed(() => count() * multiplier());

    expect(total()).toBe(6);

    // Update signal
    count.set(5);
    // Computed value is updated instantly on read!
    expect(total()).toBe(15);
  });
});`,
    tags: ['testing', 'signals', 'computed', 'effects', 'rxjs', 'marble-testing']
  }
];
