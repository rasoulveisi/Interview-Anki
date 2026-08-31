import { Question } from '../types';

export const patternsQuestions: Question[] = [
  {
    id: 'pat_01',
    category: 'patterns',
    topic: 'Facade & Adapter Patterns in Frontend',
    difficulty: 'Senior',
    question: 'How do you apply the Facade Pattern and the Adapter Pattern in frontend architecture? Provide real-world Angular/TypeScript examples.',
    shortAnswer: 'The **Facade Pattern** provides a unified, simplified interface over complex underlying subsystems (such as combining NgRx store selectors, dispatch actions, and HTTP polling into a single `UserFacadeService` for components). The **Adapter Pattern** translates one interface into another (such as wrapping a third-party chart library like Chart.js/D3 into a standardized Angular component interface).',
    seniorPoint: 'A Facade decouples presentation components from state management libraries. If you decide to migrate from NgRx to SignalStore or custom Services, you only update the Facade implementation; zero component code changes are needed.',
    spokenTip: 'Facade simplifies and aggregates complex subsystems; Adapter converts incompatible interfaces.',
    interviewAnswer: '1. **Facade Pattern**: In large apps, components often need to select 4 slices of state, dispatch 3 actions, and coordinate local spinners. A Facade service aggregates these into clean observables/signals and methods (`facade.users()`, `facade.loadUsers()`, `facade.saveUser(u)`), shielding UI components from store complexity.\n2. **Adapter Pattern**: Third-party libraries (e.g. D3, Highcharts, Stripe Elements) have their own external APIs. We create an Adapter service or wrapper component that conforms to our internal design system interfaces, transforming our domain data into the third-party shape.',
    keyPointsToMention: [
      'Facade: Simplifies multiple subsystem dependencies for dumb UI components',
      'Shielding components from direct store coupling (NgRx / Redux)',
      'Adapter: Bridges incompatible third-party APIs with application domain models',
      'Maintainability benefits when swapping third-party dependencies'
    ],
    whatInterviewersLookFor: [
      'Clear architectural rationale for insulating UI components from state management libraries',
      'Concrete TypeScript examples of both patterns'
    ],
    codeExample: `// 1. Facade Pattern: Clean interface over NgRx/Signals complexity
@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private store = inject(Store);
  
  // Expose clean signals/observables to UI
  readonly products$ = this.store.select(selectAllProducts);
  readonly isLoading$ = this.store.select(selectProductsLoading);

  loadProducts() {
    this.store.dispatch(ProductActions.load());
  }

  deleteProduct(id: string) {
    this.store.dispatch(ProductActions.delete({ id }));
  }
}

// 2. Adapter Pattern: Third-party Chart adapter
export interface StandardChartSeries {
  label: string;
  value: number;
}

export function adaptToChartJsConfig(data: StandardChartSeries[]) {
  return {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: '#3b82f6'
    }]
  };
}`,
    tags: ['patterns', 'facade-pattern', 'adapter-pattern', 'design-patterns', 'software-architecture']
  },
  {
    id: 'pat_02',
    category: 'patterns',
    topic: 'Strategy & State Machine Patterns',
    difficulty: 'Senior',
    question: 'How do you implement the Strategy Pattern and Finite State Machines (FSM) to eliminate nested boolean spaghetti (`isLoading`, `hasError`, `isSuccess`, `isEmpty`)?',
    shortAnswer: 'The **Strategy Pattern** defines a family of interchangeable algorithms (e.g. validation strategies or payment processors) adhering to a common interface, allowing dynamic algorithm selection at runtime. **Finite State Machines (FSM)** replace multiple conflicting boolean flags (`isLoading && !isError && data.length === 0`) with a single explicit `status: "idle" | "loading" | "success" | "empty" | "error"` state union.',
    seniorPoint: 'Boolean state flags can produce $2^N$ impossible states (e.g., `isLoading: true` and `isError: true` at the same time). Discriminated state unions and state machines make impossible UI states unrepresentable.',
    spokenTip: 'Replace multiple independent booleans with a single state union to eliminate impossible states.',
    interviewAnswer: '1. **Strategy Pattern**: Instead of a monolithic `switch (type)` with 200 lines, we define a `PaymentStrategy` interface with `executePayment()`. We register `CreditCardStrategy`, `PayPalStrategy`, `ApplePayStrategy` into a registry map, selecting the right strategy dynamically at runtime.\n2. **Finite State Machine Pattern**: In UI components, managing `isLoading`, `isSubmitted`, `isError`, `isEmpty` leads to boolean spaghetti and UI glitches (showing spinner and error simultaneously). By modeling state as an explicit machine: `type ViewState = { status: \\\'idle\\\' } | { status: \\\'loading\\\' } | { status: \\\'success\\\'; data: Item[] } | { status: \\\'error\\\'; message: string }`, we guarantee mutually exclusive, predictable transitions.',
    keyPointsToMention: [
      'Eliminating impossible UI states via discriminated unions',
      'Strategy pattern for open-closed principle (OCP) adherence',
      'Deterministic state transitions in UI workflows (wizards, checkouts)'
    ],
    whatInterviewersLookFor: [
      'Strong critique of boolean flag proliferation',
      'Ability to implement a clean TypeScript discriminated union state machine'
    ],
    codeExample: `// 1. Strategy Pattern for Dynamic Validation
interface ValidationStrategy {
  validate(value: string): string | null;
}

const emailStrategy: ValidationStrategy = {
  validate: (val) => (/^\\S+@\\S+\\.\\S+$/.test(val) ? null : 'Invalid email format')
};

const phoneStrategy: ValidationStrategy = {
  validate: (val) => (/^\\+?[0-9]{10,14}$/.test(val) ? null : 'Invalid phone number')
};

const validatorRegistry: Record<string, ValidationStrategy> = {
  email: emailStrategy,
  phone: phoneStrategy
};

// 2. State Pattern / FSM State Union (No impossible states!)
type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };`,
    tags: ['patterns', 'strategy-pattern', 'state-machine', 'discriminated-unions', 'clean-code']
  }
];
