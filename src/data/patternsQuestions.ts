import { Question } from '../types';

export const patternsQuestions: Question[] = [
  {
    id: 'pat_01',
    category: 'patterns',
    topic: 'Structural Patterns: Facade & Adapter',
    difficulty: 'Senior',
    question: 'How do you apply the Facade and Adapter design patterns in frontend architecture to decouple components from complex subsystems and legacy APIs?',
    shortAnswer: 'A **Facade** provides a simplified, unified high-level interface over a complex subsystem (e.g. wrapping auth, permissions, analytics, and token refresh behind a single `UserFacadeService`). An **Adapter** converts the incompatible interface of a third-party or legacy API into the target interface expected by the application.',
    interviewAnswer: 'Design patterns prevent tight coupling between UI views and low-level subsystem complexity:\n1. **Facade Pattern**:\n   - *Problem*: A checkout screen needs to interact with `CartService`, `DiscountCalculator`, `PaymentGateway`, `AnalyticsTracker`, and `InventoryChecker`. Injecting 5 services directly into the component creates tight coupling and makes refactoring difficult.\n   - *Solution*: Create a `CheckoutFacade` service that encapsulates the orchestration and exposes clean, simple Signals or Observables to the component (`checkoutState()`, `submitOrder()`). The component remains completely dumb regarding backend coordination.\n2. **Adapter Pattern**:\n   - *Problem*: Your app needs to switch payment providers from Stripe to Adyen, or a legacy backend returns XML/unnormalized snake_case objects that do not match your standard TypeScript model.\n   - *Solution*: Define a common domain interface (`PaymentProcessor`). Write `StripeAdapter` and `AdyenAdapter` classes implementing that interface. The UI consumes `PaymentProcessor` without caring which third-party SDK is running underneath.',
    spokenTip: 'Facade simplifies multiple complex services into one clean API; Adapter translates incompatible interfaces into a standardized contract.',
    example: {
      language: 'typescript',
      code: `// 1. Adapter Pattern: Standardizing Third-Party Payment SDKs
interface PaymentGateway {
  processCharge(amountCents: number, currency: string): Promise<{ success: boolean; txId: string }>;
}

export class StripeAdapter implements PaymentGateway {
  constructor(private stripeSdk: any) {}

  async processCharge(amountCents: number, currency: string) {
    const res = await this.stripeSdk.confirmPayment({ amount: amountCents, curr: currency });
    return { success: res.status === 'succeeded', txId: res.id };
  }
}

// 2. Facade Pattern: Simplifying Multi-Service Checkout Subsystem
@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private cart = inject(CartService);
  private payment = inject(PaymentService);
  private analytics = inject(AnalyticsService);

  readonly isProcessing = signal(false);

  async completeCheckout() {
    this.isProcessing.set(true);
    try {
      const order = await this.cart.createOrderSnapshot();
      const tx = await this.payment.pay(order.total);
      this.analytics.trackPurchase(tx.txId);
      this.cart.clear();
    } finally {
      this.isProcessing.set(false);
    }
  }
}`,
      explanation: 'Demonstrates Adapter standardizing third-party SDKs and Facade orchestrating multiple services.'
    },
    seniorPoint: 'Combining the Facade pattern with Angular Signals provides clean architecture: the Facade encapsulates state mutations internally and exposes only read-only `Signal` or `Observable` getters to UI components.',
    followUps: [
      {
        question: 'What is the difference between an Adapter and a Proxy pattern?',
        answer: 'An Adapter changes the interface of an existing object to match a new contract. A Proxy provides the *exact same* interface but controls access, adds caching, logging, or lazy initialization.'
      },
      {
        question: 'When does a Facade become an anti-pattern ("God Service")?',
        answer: 'When a Facade grows beyond a specific domain feature and starts handling unrelated business logic across the entire app. Keep facades scoped strictly per feature domain (e.g. `BillingFacade`, `UserProfileFacade`).'
      }
    ],
    keyPointsToMention: [
      'Facade: unified high-level interface over multiple complex services/subsystems',
      'Adapter: wrapper converting incompatible third-party interfaces into internal contracts',
      'Decoupling UI components from third-party vendor SDKs (Stripe, Analytics, Auth0)',
      'Scoping facades per feature to avoid bloated god objects'
    ],
    tags: ['patterns', 'facade', 'adapter', 'design-patterns', 'architecture', 'clean-code']
  },
  {
    id: 'pat_02',
    category: 'patterns',
    topic: 'Behavioral Patterns: Strategy & State Machine (FSM)',
    difficulty: 'Senior',
    question: 'How do you implement the Strategy Pattern and Finite State Machines (FSM) in TypeScript using Discriminated Unions to eliminate nested if/else flags?',
    shortAnswer: 'The **Strategy Pattern** defines a family of interchangeable algorithms conforming to a common interface, selected dynamically at runtime. A **Finite State Machine (FSM)** models an entity as a set of mutually exclusive states with explicit allowed transitions, using TypeScript Discriminated Unions to eliminate boolean flag spaghetti (`isLoading`, `isError`, `isSuccess`).',
    interviewAnswer: 'Managing complex UI behavior with multiple boolean flags (`isLoading`, `isError`, `isSuccess`, `hasData`) leads to "Impossible State" bugs—such as having both `isLoading: true` and `isError: true` simultaneously.\n\n**Finite State Machine (FSM) with Discriminated Unions**:\nWe model state as a single discriminated union type: `Idle | Loading | Success | Error`. The state transitions are deterministic: calling `transition("FETCH")` from `Idle` moves to `Loading`; from `Loading`, it can only transition to `Success` or `Error`. This guarantees that impossible states cannot compile or execute.\n\n**Strategy Pattern**:\nInstead of a 200-line `switch (exportFormat)` or nested `if/else` checks, we define an `ExportStrategy` interface with concrete classes: `CsvExportStrategy`, `PdfExportStrategy`, `JsonExportStrategy`. The calling code simply calls `strategy.export(data)`, allowing new export formats to be added following the Open-Closed Principle (OCP) without editing existing code.',
    spokenTip: 'Use Discriminated Unions for state machines to eliminate boolean flag bugs, and the Strategy pattern to make algorithms interchangeable.',
    example: {
      language: 'typescript',
      code: `// 1. Finite State Machine (FSM) via Discriminated Unions
type PlayerState = 
  | { status: 'stopped' }
  | { status: 'playing'; trackId: string; volume: number }
  | { status: 'paused'; trackId: string; positionMs: number }
  | { status: 'error'; message: string };

function playerReducer(state: PlayerState, event: { type: 'PLAY'; trackId: string } | { type: 'PAUSE' }): PlayerState {
  switch (state.status) {
    case 'stopped':
    case 'paused':
      if (event.type === 'PLAY') return { status: 'playing', trackId: event.trackId, volume: 80 };
      return state;
    case 'playing':
      if (event.type === 'PAUSE') return { status: 'paused', trackId: state.trackId, positionMs: 1200 };
      return state;
    case 'error':
      return state; // Cannot play from error without reset
  }
}

// 2. Strategy Pattern for Discount Calculations
interface DiscountStrategy {
  calculate(price: number): number;
}
export class VipDiscount implements DiscountStrategy {
  calculate(price: number) { return price * 0.8; } // 20% off
}
export class SeasonalDiscount implements DiscountStrategy {
  calculate(price: number) { return price - 15; } // $15 off
}`,
      explanation: 'Demonstrates FSM with impossible state prevention and Strategy pattern for discount algorithms.'
    },
    seniorPoint: 'Discriminated unions make your state self-documenting. If you add a new state variant, TypeScript\'s exhaustive checking forces you to handle it in every transition reducer.',
    followUps: [
      {
        question: 'How do libraries like XState elevate Finite State Machines in modern web apps?',
        answer: 'XState provides formal Statecharts (hierarchical nested states, parallel states, visual studio diagrams, and actor model concurrency) with strict runtime validation.'
      },
      {
        question: 'How does the Strategy Pattern support the Open-Closed Principle (SOLID)?',
        answer: 'New strategies can be introduced by adding a new class implementing the strategy interface without modifying or risking regressions in existing strategy classes.'
      }
    ],
    keyPointsToMention: [
      'Eliminating boolean flag spaghetti (isLoading, isError) via Discriminated Unions',
      'Finite State Machine: explicit allowed states and transition rules',
      'Strategy Pattern: interchangeable algorithms adhering to common interface (Open-Closed Principle)',
      'Compile-time exhaustiveness checking on state transitions'
    ],
    tags: ['patterns', 'strategy-pattern', 'state-machine', 'fsm', 'discriminated-unions', 'solid']
  },
  {
    id: 'pat_03',
    category: 'patterns',
    topic: 'Observer vs Publish-Subscribe (Pub/Sub)',
    difficulty: 'Senior',
    question: 'What is the architectural difference between the Observer Pattern and the Publish-Subscribe (Pub/Sub) Pattern? When should you avoid a global Event Bus?',
    shortAnswer: 'In the **Observer Pattern**, the subject maintains a direct list of observers and notifies them directly (tight coupling, e.g. RxJS Observable/Subject). In **Pub/Sub**, publishers and subscribers never know about each other; they communicate strictly through an intermediate Message Broker or Event Channel (loose coupling). Avoid global Event Buses in large SPAs because they make data flow untraceable and cause memory leaks.',
    interviewAnswer: 'While often confused, Observer and Pub/Sub have key structural differences:\n\n1. **Observer Pattern**:\n   - *Direct Coupling*: The `Subject` maintains an internal array of `Observer` instances and calls `observer.next(data)` directly.\n   - *Synchronous Execution*: In RxJS, emissions are typically synchronous unless piped with schedulers or async operators.\n2. **Publish-Subscribe (Pub/Sub)**:\n   - *Complete Decoupling*: Publishers fire events to an intermediate `EventBus` topic. Subscribers listen to that topic. The publisher has zero knowledge of who (or how many) subscribers exist.\n3. **Why Global Event Buses are an Enterprise Anti-Pattern**:\n   - *Untraceable State*: When 20 features emit and listen to arbitrary string event names (`"user:updated"`, `"order:created"`), debugging state mutations in large apps becomes a nightmare.\n   - *Memory Leaks*: Components forgetting to call `bus.off(event, handler)` remain pinned in memory by the global bus singleton.',
    spokenTip: 'Observer has direct subject-to-observer connection (like RxJS); Pub/Sub uses an intermediate broker. Avoid global string-based event buses because they make debugging impossible.',
    example: {
      language: 'typescript',
      code: `// 1. Observer Pattern (RxJS: Direct Observable-to-Observer relationship)
const subject$ = new Subject<number>();
const subscription = subject$.subscribe(val => console.log('Direct observer:', val));
subject$.next(42);

// 2. Pub/Sub Broker Pattern (Mediated through Event Channel)
class EventBroker {
  private channels = new Map<string, Array<(payload: any) => void>>();

  subscribe(topic: string, handler: (payload: any) => void) {
    if (!this.channels.has(topic)) this.channels.set(topic, []);
    this.channels.get(topic)!.push(handler);
    return () => {
      const handlers = this.channels.get(topic) || [];
      this.channels.set(topic, handlers.filter(h => h !== handler));
    };
  }

  publish(topic: string, payload: any) {
    this.channels.get(topic)?.forEach(fn => fn(payload));
  }
}`,
      explanation: 'Contrasts direct RxJS Subject observer binding with mediated Pub/Sub message broker.'
    },
    seniorPoint: 'Instead of an untyped global Event Bus, use structured State Stores (NgRx, Zustand) or typed Domain Events. This provides Redux DevTools time-travel debugging, action history, and strict TypeScript payload checking.',
    followUps: [
      {
        question: 'How do you prevent memory leaks when subscribing to event brokers?',
        answer: 'Always return an unsubscription cleanup function from the subscribe method and invoke it inside `ngOnDestroy` (Angular) or `useEffect` cleanup (React).'
      },
      {
        question: 'How does the Broker in Pub/Sub help micro-frontend architectures?',
        answer: 'It allows independently deployed micro-frontends written in different frameworks (Angular, React, Vue) to communicate via standard browser `window.addEventListener("custom-event")` without shared framework dependencies.'
      }
    ],
    keyPointsToMention: [
      'Observer: Direct connection between Subject and Observers (RxJS)',
      'Pub/Sub: Indirect communication mediated by a message broker or event channel',
      'Anti-pattern: global string-based event buses creating untraceable spaghetti state and memory leaks',
      'Typed domain events and state stores as scalable alternatives'
    ],
    tags: ['patterns', 'observer', 'pub-sub', 'event-bus', 'rxjs', 'architecture']
  },
  {
    id: 'pat_04',
    category: 'patterns',
    topic: 'Factory Pattern & Dependency Injection vs Service Locator',
    difficulty: 'Senior',
    question: 'How does the Factory Pattern work with Dependency Injection? Why is the Service Locator considered an anti-pattern compared to Constructor Injection?',
    shortAnswer: 'The **Factory Pattern** encapsulates object creation logic at runtime based on dynamic parameters or configuration. **Constructor Injection** explicitly declares all class dependencies in the constructor, making them obvious and easily mocked for testing. The **Service Locator** anti-pattern passes a global locator/container into the class and queries it internally (`locator.get(Service)`), hiding dependencies and causing runtime failures.',
    interviewAnswer: 'In enterprise application architecture:\n1. **Factory Pattern in DI**: Often used when a service or client cannot be created until runtime parameters (e.g. active tenant ID, user auth token, or dynamic API endpoint) are provided. We inject a `HttpClientFactory` or use `useFactory` in Angular/ASP.NET Core providers to construct and configure the object.\n2. **Constructor Injection (Best Practice)**:\n   - Explicit: Reading the constructor `constructor(private auth: AuthService, private db: DbContext)` immediately reveals what the class needs.\n   - Testable: In unit tests, you pass fake/mock dependencies directly without booting a DI container.\n3. **Service Locator (Anti-Pattern)**:\n   - Hides dependencies: A class constructor only takes `(private locator: IServiceProvider)`. Looking at the class signature gives zero indication of what services it actually calls.\n   - Runtime crashes: If a required service is missing from the container, the failure occurs at runtime deep inside a method call instead of at compile-time/instantiation.',
    spokenTip: 'Constructor Injection makes dependencies explicit and testable; Service Locator hides dependencies inside methods and causes runtime crashes.',
    example: {
      language: 'typescript',
      code: `// ❌ ANTI-PATTERN: Service Locator (Hidden dependencies, runtime crashes)
export class OrderProcessorBad {
  constructor(private locator: ServiceLocator) {}

  process() {
    // ⚠️ Hidden dependency! Fails at runtime if 'PaymentService' wasn't registered!
    const payment = this.locator.get<PaymentService>('PaymentService');
    payment.charge();
  }
}

// ✅ BEST PRACTICE: Constructor Injection (Explicit contract, 100% testable)
export class OrderProcessorGood {
  // Dependencies are obvious at compile time!
  constructor(private payment: PaymentService, private logger: LoggerService) {}

  process() {
    this.payment.charge();
    this.logger.log('Order processed');
  }
}

// Factory Pattern: Dynamic Runtime Tenant API Client Creation
export class ApiClientFactory {
  createClient(tenantId: string): ApiClient {
    const baseUrl = tenantId === 'eu' ? 'https://eu.api.com' : 'https://us.api.com';
    return new ApiClient(baseUrl);
  }
}`,
      explanation: 'Contrasts hidden dependencies of Service Locator with explicit Constructor Injection and dynamic Factory pattern.'
    },
    seniorPoint: 'In ASP.NET Core and Angular, using `IServiceProvider.GetService()` inside business logic is a Service Locator code smell. The only acceptable place for a Service Locator is inside low-level framework infrastructure, composition roots, or custom middleware factories.',
    followUps: [
      {
        question: 'When is using a Factory method genuinely required in Dependency Injection?',
        answer: 'When the creation of an object depends on dynamic runtime data (e.g. user input, calculated config) rather than static application startup configuration.'
      },
      {
        question: 'How do you mock dependencies for Constructor Injection in unit tests?',
        answer: 'Instantiate the class directly using `new MyService(mockDependency1, mockDependency2)` without needing any DI container or reflection in your unit tests.'
      }
    ],
    keyPointsToMention: [
      'Factory pattern for dynamic runtime object creation',
      'Constructor Injection: explicit contracts, compile-time safety, easy mocking',
      'Service Locator anti-pattern: hidden dependencies, runtime failure risk, hard to test',
      'Composition root exception for framework bootstrap'
    ],
    tags: ['patterns', 'factory-pattern', 'dependency-injection', 'service-locator', 'architecture', 'solid']
  }
];
