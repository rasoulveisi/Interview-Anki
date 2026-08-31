import { Question } from '../types';

export const architectureQuestions: Question[] = [
  {
    id: 'arch_01',
    category: 'architecture',
    topic: 'Enterprise Folder Structure & Monorepos',
    difficulty: 'Senior',
    question: 'How do you design a scalable Feature-Based Monorepo architecture (Nx)? Explain Domain-Driven Design (DDD) library types and module boundary enforcement.',
    shortAnswer: 'Structure the codebase around business domain boundaries rather than technical layers. In an Nx monorepo, categorize libraries into 4 standardized DDD types: `feature` (smart containers/routing), `ui` (dumb presentational components), `data-access` (services, stores, API clients), and `util` (pure helpers). Enforce unidirectional dependencies using Nx `@nx/enforce-module-boundaries` ESLint rules.',
    interviewAnswer: 'For enterprise multi-team codebases, organizing by technical type (`/components`, `/services`, `/models`) causes spaghetti coupling. Instead, we structure by Domain-Driven Design (DDD) feature verticals:\n1. **Domains**: E.g. `orders`, `billing`, `identity`, `catalog`.\n2. **Standardized Library Types per Domain**:\n   - `feature-*`: Smart, route-level container components orchestrating state.\n   - `ui-*`: Pure presentational "dumb" components with `@Input` and `@Output` (zero service injection).\n   - `data-access-*`: API HTTP services, Signal/NgRx stores, and entity models.\n   - `util-*`: Pure utility functions, pipes, and formatters.\n3. **Module Boundary Enforcement**: Using Nx ESLint tags (`scope:orders`, `type:feature`), we enforce strict lint rules: e.g. `ui` libraries can NEVER import `data-access` or `feature` libraries, and `orders` cannot directly import internal code from `billing` except through public API barrels.',
    spokenTip: 'I organize code by business domains and standard library types (feature, ui, data-access, util), enforcing boundaries with automated ESLint rules.',
    example: {
      language: 'json',
      code: `// .eslintrc.json: Nx Module Boundary Enforcement
{
  "rules": {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        "enforceBuildableLibDependency": true,
        "allow": [],
        "depConstraints": [
          {
            "sourceTag": "type:ui",
            "onlyDependOnLibsWithTags": ["type:util"]
          },
          {
            "sourceTag": "type:data-access",
            "onlyDependOnLibsWithTags": ["type:util"]
          },
          {
            "sourceTag": "type:feature",
            "onlyDependOnLibsWithTags": ["type:ui", "type:data-access", "type:util"]
          },
          {
            "sourceTag": "scope:orders",
            "onlyDependOnLibsWithTags": ["scope:orders", "scope:shared"]
          }
        ]
      }
    ]
  }
}`,
      explanation: 'Nx ESLint configuration enforcing domain boundaries and strict architectural layering.'
    },
    seniorPoint: 'Enforcing module boundaries at the ESLint / CI level stops junior developers or tight deadlines from creating circular cross-domain imports, keeping features independently testable and deployable.',
    followUps: [
      {
        question: 'What is Nx Affected and how does it optimize CI/CD pipelines?',
        answer: 'Nx builds a dependency graph of the entire repository. On every pull request, `nx affected --target=test` only lints, tests, and builds the specific libraries and applications affected by the changed files, reducing CI times by 80%.'
      },
      {
        question: 'Why should `ui` libraries contain only dumb components?',
        answer: 'Dumb components have no service or store dependencies, making them easy to test in isolation, preview in Storybook, and reuse across multiple feature screens.'
      }
    ],
    keyPointsToMention: [
      'Feature-first / Domain-Driven Design (DDD) folder structure',
      '4 Nx library categories: feature, ui, data-access, util',
      'Automated dependency rules via @nx/enforce-module-boundaries',
      'CI optimization via Nx Affected computation graphs'
    ],
    tags: ['architecture', 'nx', 'monorepo', 'ddd', 'module-boundaries', 'enterprise']
  },
  {
    id: 'arch_02',
    category: 'architecture',
    topic: 'Micro-Frontends & Module Federation',
    difficulty: 'Senior',
    question: 'How does Webpack / Rspack Module Federation work for Micro-Frontends? How do you manage shared dependencies, singleton versions, and routing sync?',
    shortAnswer: 'Module Federation dynamically loads independently compiled and deployed JavaScript remotes into a host application at runtime. Shared dependencies (like `@angular/core`, `react`) are configured with `singleton: true` and `strictVersion: true` to prevent loading duplicate runtime frameworks. Route synchronization is coordinated via browser history events or custom event buses.',
    interviewAnswer: "Module Federation enables autonomous teams to independently build, test, and deploy feature micro-apps without redeploying the host container:\n1. **Host & Remotes**: The Host application acts as the shell/layout. Remotes expose remote entry manifests (`remoteEntry.js`) exposing specific routes or widgets.\n2. **Shared Dependencies (`shared`)**: Configured in `module-federation.config.js`. Specifying `singleton: true` guarantees only ONE copy of `@angular/core` or `react` is instantiated in the browser. `strictVersion: true` ensures version compatibility, while `requiredVersion: '^18.0.0'` prevents fatal mismatch crashes.\n3. **Runtime Orchestration**: The host router lazy-loads remotes using dynamic `import('remoteApp/OrdersModule')`.\n4. **Cross-App Communication**: Keep micro-frontends decoupled. Avoid shared state stores across apps. Instead, communicate via URL query parameters, custom browser `window.dispatchEvent(new CustomEvent(...))`, or an event-bus package.",
    spokenTip: 'Module Federation loads independently deployed apps at runtime. Configure singleton dependencies carefully to avoid duplicate framework instances.',
    example: {
      language: 'javascript',
      code: `// module-federation.config.js (Webpack / Rspack / Native Federation)
module.exports = {
  name: 'host_shell',
  remotes: {
    ordersRemote: 'ordersRemote@https://orders.company.com/remoteEntry.js',
    billingRemote: 'billingRemote@https://billing.company.com/remoteEntry.js'
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    'rxjs': { singleton: true, strictVersion: false }
  }
};`,
      explanation: 'Module Federation configuration showing remote manifests and singleton shared dependencies.'
    },
    seniorPoint: 'If `singleton: true` is omitted for framework core libraries, React or Angular will be loaded twice in the browser tab. This causes broken context providers, duplicate Zone.js instances, and `Invalid Hook Call` errors.',
    followUps: [
      {
        question: 'When should a team NOT use Micro-Frontends?',
        answer: 'For small teams (< 20 engineers) or apps with tightly coupled user workflows. Micro-frontends introduce massive operational overhead (governance, CI pipelines, version drift, complex CSS isolation).'
      },
      {
        question: 'How do you prevent CSS style pollution between micro-frontends?',
        answer: 'Use CSS Scoping (Angular component view encapsulation, CSS Modules), unique CSS class prefixes (BEM / Tailwind prefixes), or Shadow DOM boundaries.'
      }
    ],
    keyPointsToMention: [
      'Module Federation: runtime dynamic loading of independently deployed remotes',
      'Shared dependency management (singleton: true, strictVersion: true)',
      'Cross-microfrontend communication strategies (URL params, CustomEvent)',
      'CSS isolation and trade-offs of micro-frontend operational complexity'
    ],
    tags: ['architecture', 'micro-frontends', 'module-federation', 'webpack', 'rspack', 'enterprise']
  },
  {
    id: 'arch_03',
    category: 'architecture',
    topic: 'API Abstraction & Runtime Validation',
    difficulty: 'Senior',
    question: 'How do you build a resilient API Abstraction Layer in TypeScript? Contrast compile-time types with runtime schema validation (Zod).',
    shortAnswer: 'A robust API layer abstracts raw HTTP transports behind typed service facades and maps backend DTOs to UI View Models. Because TypeScript types are completely erased at runtime, use **Zod** schema parsing (`schema.safeParse()`) at the API boundary to catch malformed server payloads, contract drift, and null pointer exceptions before they corrupt UI state.',
    interviewAnswer: 'In enterprise applications, directly using raw backend API responses in UI components creates fragile coupling. A resilient API Abstraction Layer consists of 3 steps:\n1. **Contract Generation**: Automatically generate TypeScript DTOs from OpenAPI/Swagger backend specs via tools like `openapi-typescript`.\n2. **Runtime Schema Validation (Zod)**: TypeScript interfaces only exist at compile-time. If the backend changes a field from `number` to `string` or returns `null` unexpectedly, TypeScript will not protect the running application. Parsing responses through a Zod schema (`UserSchema.safeParse(res)`) validates the contract at the boundary.\n3. **Data Mapping (DTO to View Model)**: A dedicated mapper converts server data (snake_case, ISO date strings) into frontend View Models (camelCase, instantiated Dates, formatted currencies). If the backend schema changes, you only update the mapper—zero UI components break.',
    spokenTip: 'TypeScript types disappear at runtime. Validate API responses with Zod at the boundary and map DTOs into clean View Models.',
    example: {
      language: 'typescript',
      code: `import { z } from 'zod';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

// 1. Zod Schema: Runtime Validator + Inferred TypeScript Type
export const UserApiDtoSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  registered_at: z.string().datetime(),
  is_active: z.boolean().default(true)
});
export type UserApiDto = z.infer<typeof UserApiDtoSchema>;

// 2. Clean Frontend View Model
export interface UserViewModel {
  id: string;
  displayName: string;
  memberSince: Date;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);

  getUser(id: string) {
    return this.http.get(\`/api/users/\${id}\`).pipe(
      map(rawData => {
        // Runtime contract validation
        const result = UserApiDtoSchema.safeParse(rawData);
        if (!result.success) {
          console.error('API Contract Violation:', result.error.format());
          throw new Error('Invalid server data format.');
        }
        // Transform DTO -> UI View Model
        const dto = result.data;
        return {
          id: dto.user_id,
          displayName: dto.full_name,
          memberSince: new Date(dto.registered_at)
        } satisfies UserViewModel;
      })
    );
  }
}`,
      explanation: 'Uses Zod safeParse for runtime schema validation and maps backend DTO to frontend View Model.'
    },
    seniorPoint: 'Zod schemas allow graceful defaults (`z.boolean().default(true)`). If the backend accidentally omits a newly added optional field, Zod fills in the default value instead of crashing the UI with `undefined`.',
    followUps: [
      {
        question: 'What is the performance overhead of Zod validation on large API payloads?',
        answer: 'Validating a 10,000-item array with deep nested schemas can take 20ms-50ms. For massive arrays, validate only the first few items in production as a canary check, or run full validation in staging/dev environments.'
      },
      {
        question: 'How does `z.infer<typeof Schema>` eliminate duplicate type definitions?',
        answer: '`z.infer` automatically extracts the static TypeScript interface directly from the runtime Zod schema, ensuring compile-time types and runtime schemas are always 100% in sync with zero duplication.'
      }
    ],
    keyPointsToMention: [
      'TypeScript type erasure: TypeScript types cannot validate live network data',
      'Runtime schema validation with Zod / Yup / Valibot (safeParse)',
      'DTO to View Model transformation layer (isolating backend naming conventions)',
      'Automated TypeScript type generation from OpenAPI / Swagger'
    ],
    tags: ['architecture', 'api-design', 'zod', 'typescript', 'runtime-validation', 'clean-code']
  },
  {
    id: 'arch_04',
    category: 'architecture',
    topic: 'SOLID Principles in Frontend Architecture',
    difficulty: 'Senior',
    question: 'How do you apply SOLID principles to modern TypeScript and component-based frontend architectures? Give concrete examples for SRP and DIP.',
    shortAnswer: 'SOLID principles guide modular frontend design: **SRP (Single Responsibility)** separates UI rendering (dumb components) from data fetching (services) and state management. **OCP (Open/Closed)** uses component composition/slots to extend behavior without editing existing files. **LSP (Liskov)** ensures sub-components honor base prop contracts. **ISP (Interface Segregation)** passes narrow, focused props rather than bloated multi-field objects. **DIP (Dependency Inversion)** injects abstract tokens/interfaces rather than concrete implementations.',
    interviewAnswer: 'Applying SOLID in modern frontend development prevents tangled, unmaintainable code:\n\n1. **Single Responsibility Principle (SRP)**: A component should have one reason to change. If a component handles HTTP fetching, form validation, state management, AND styling, split it: A Dumb UI Component handles rendering, a Custom Hook / Service handles data fetching, and a Form Validator handles rules.\n2. **Open/Closed Principle (OCP)**: Components should be open for extension, closed for modification. Use Component Composition (children props / `<ng-content>`) instead of adding 20 boolean flags (`isCheckout`, `isCompact`, `showSearch`) to a single component.\n3. **Interface Segregation Principle (ISP)**: A dumb `<UserAvatar user={user} />` component should not take a 50-property `User` object if it only needs `name` and `avatarUrl`. Pass `{ name: string; avatarUrl: string }` instead.\n4. **Dependency Inversion Principle (DIP)**: High-level features depend on abstractions (e.g. `StorageService` interface or `InjectionToken`), allowing you to swap `LocalStorageService` with `IndexedDbService` or mock storage during unit testing with zero code changes.',
    spokenTip: 'Apply SOLID by keeping components focused on rendering, using slots instead of prop flags, passing narrow props, and injecting abstract tokens.',
    example: {
      language: 'typescript',
      code: `// 1. Dependency Inversion: Abstract Storage Token
export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const STORAGE_SERVICE = new InjectionToken<IStorageService>('STORAGE_SERVICE');

// 2. High-level service depends on abstraction, NOT concrete localStorage!
@Injectable({ providedIn: 'root' })
export class UserPreferenceService {
  private storage = inject(STORAGE_SERVICE);

  getTheme(): string {
    return this.storage.getItem('theme') || 'light';
  }
}

// 3. Easy to swap concrete implementation in testing or server environments!
// providers: [{ provide: STORAGE_SERVICE, useClass: MockStorageService }]`,
      explanation: 'Applies Dependency Inversion Principle using Angular InjectionToken abstraction for easy test swapping.'
    },
    seniorPoint: 'Don\'t over-engineer SOLID into simple apps. Start simple; introduce interfaces and service abstractions when multiple implementations or complex unit test mocking are genuinely required.',
    followUps: [
      {
        question: 'How does Interface Segregation improve component reusability and testing?',
        answer: 'When a component accepts only the 2 properties it needs instead of an entire domain entity, unit tests don\'t have to construct fake 50-property mock objects to test a simple avatar.'
      },
      {
        question: 'What is the Liskov Substitution Principle (LSP) in React component hierarchies?',
        answer: 'Any custom button component extending HTML button props (`ButtonProps extends ComponentProps<"button">`) must honor standard HTML button behaviors (e.g. `disabled`, `onClick`, `type`) without unexpected side effects.'
      }
    ],
    keyPointsToMention: [
      'SRP: Separating UI presentation, data access, and business logic',
      'OCP: Composition and slots over prop explosion flags',
      'ISP: Narrow props interfaces instead of fat entity objects',
      'DIP: Injecting abstractions (InjectionToken / TypeScript interfaces) for testability'
    ],
    tags: ['architecture', 'solid', 'design-principles', 'clean-architecture', 'typescript', 'enterprise']
  },
  {
    id: 'arch_05',
    category: 'architecture',
    topic: 'Global Error Handling & Observability',
    difficulty: 'Senior',
    question: 'How do you architect an Enterprise Error Handling and Observability pipeline in a Single Page Application? Detail Sentry breadcrumbs, unhandled rejection traps, and user feedback.',
    shortAnswer: 'Implement a centralized `GlobalErrorHandler` (implementing `ErrorHandler` in Angular or Error Boundaries in React) paired with `window.addEventListener("unhandledrejection")`. Enrich every error with user session ID, route URL, timestamp, and HTTP breadcrumbs before shipping to Sentry/Datadog, and display user-friendly fallback recovery banners.',
    interviewAnswer: 'Enterprise frontend observability requires capturing both sync and async errors with rich debugging context:\n\n1. **Centralized Error Trap**:\n   - *Angular*: Implement a custom `ErrorHandler` class to catch all runtime template and component exceptions.\n   - *React*: Wrap routes in class `ErrorBoundary` components.\n   - *Global Window Traps*: Listen to `window.onerror` and `window.addEventListener(\'unhandledrejection\', event => ...)` to catch unhandled Promise rejections.\n2. **Contextual Telemetry & Breadcrumbs**:\n   - Before sending an error to Sentry or Datadog, attach **Breadcrumbs**: the last 5 user clicks, previous route transitions, active feature flags, and failed HTTP status codes.\n   - Strip sensitive Personally Identifiable Information (PII) like passwords or credit card numbers.\n3. **User Experience & Graceful Degradation**:\n   - Never show raw stack traces or let the app freeze on a blank white screen.\n   - Display a localized recovery banner with a "Retry" or "Reload Page" button and an automated Error Reference Code (e.g. `ERR-84920`) for customer support.',
    spokenTip: 'Use a global error handler, enrich error reports with Sentry breadcrumbs and user session context, and show a clear recovery button to the user.',
    example: {
      language: 'typescript',
      code: `import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalLoggingErrorHandler implements ErrorHandler {
  private router = inject(Router);
  private zone = inject(NgZone);

  handleError(error: unknown): void {
    const errorId = \`err_\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}\`;
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';

    // 1. Log structured telemetry with context
    const telemetryPayload = {
      errorId,
      message,
      stack,
      url: window.location.href,
      currentRoute: this.router.url,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    console.error('Captured by GlobalErrorHandler:', telemetryPayload);
    // Send to Datadog / Sentry / CloudWatch endpoint...

    // 2. Show user-friendly notification inside NgZone
    this.zone.run(() => {
      // notificationService.showError(\`Something went wrong (Ref: \${errorId}).\`);
    });
  }
}`,
      explanation: 'Implements Angular Global ErrorHandler with telemetry enrichment and NgZone notification handling.'
    },
    seniorPoint: 'In Angular, custom `ErrorHandler` runs outside Zone.js execution when handling errors. If you trigger UI updates or modal dialogs inside `handleError`, you must wrap the UI update in `this.zone.run(() => { ... })` to trigger Change Detection properly.',
    followUps: [
      {
        question: 'How do you sanitize sensitive data (PII) before sending error reports to Sentry or Datadog?',
        answer: 'Use the SDK\'s `beforeSend` hook to scrub credit card numbers, passwords, auth tokens in headers, and user email addresses from breadcrumbs and stack traces.'
      },
      {
        question: 'What is the difference between an Error Boundary in React and `window.onerror`?',
        answer: 'Error Boundaries catch errors during React render and lifecycle methods and allow rendering a fallback UI. `window.onerror` catches global runtime errors across the entire browser page but cannot render component fallbacks.'
      }
    ],
    keyPointsToMention: [
      'Global ErrorHandler in Angular / Error Boundaries in React',
      'window.unhandledrejection listener for uncaught Promises',
      'Enriching telemetry with breadcrumbs (clicks, route transitions, failed HTTP)',
      'PII sanitization in beforeSend hook',
      'NgZone execution requirement when updating UI from Angular ErrorHandler'
    ],
    tags: ['architecture', 'error-handling', 'observability', 'telemetry', 'sentry', 'resilience']
  }
];
