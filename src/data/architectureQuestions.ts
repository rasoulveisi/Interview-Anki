import { Question } from '../types';

export const architectureQuestions: Question[] = [
  {
    id: 'arch_01',
    category: 'architecture',
    topic: 'Enterprise Folder & Module Architecture',
    difficulty: 'Senior',
    question: 'How do you architect a large-scale Frontend codebase? Contrast Feature-Based ("Screaming") Architecture with Layer-Based Architecture, and detail Nx Monorepo library tagging.',
    shortAnswer: 'Feature-based architecture groups files by business domain (`features/billing/components`, `features/billing/services`, `features/billing/types`) rather than technical role (`components/`, `services/`). In Nx Monorepos, libraries are partitioned into 4 distinct types: `feature` (smart routing/orchestration), `ui` (dumb presentational), `data-access` (services/APIs/state), and `util` (pure functions), with lint rules preventing circular dependencies.',
    seniorPoint: 'Layer-based architectures scale terribly: adding one feature requires touching 6 separate root folders. Feature-based architecture ensures code colocation, self-contained boundaries, and easy deletion/refactoring of deprecated features.',
    spokenTip: 'Structure code by business domain capabilities rather than technical file types, enforcing strict unidirectional dependency boundaries.',
    interviewAnswer: 'In enterprise frontends, we use Feature-Based Architecture (Domain-Driven Design):\n- **`core/`**: Singletons, HTTP interceptors, global auth, app-wide layout shells.\n- **`shared/`**: Reusable dumb UI components (buttons, modals, inputs), pipes, and pure utility functions with zero domain dependencies.\n- **`features/[domain]/`**: Completely encapsulated business slices (e.g. `features/checkout/`, `features/analytics/`). Each feature folder contains its own UI components, state stores, models, and routes.\n\nIn an **Nx Monorepo**, we enforce strict lint boundaries using tags:\n1. `feature-*`: Can import `ui`, `data-access`, `util`.\n2. `ui-*`: Pure presentational components; can ONLY import `util` (never data-access or other features!).\n3. `data-access-*`: API clients and state stores; can ONLY import `util`.\n4. `util-*`: Pure math, date helpers, validation functions; imports nothing.\nThis architecture eliminates circular dependencies and guarantees isolated testability.',
    keyPointsToMention: [
      'Feature-based colocation vs horizontal layer-based scattering',
      'Nx / Turborepo library classification: feature, ui, data-access, util',
      'Enforcing strict module boundaries and lint rules to ban circular imports',
      'Encapsulated domain deletion and lazy loading capability'
    ],
    whatInterviewersLookFor: [
      'Experience scaling teams with clear boundaries',
      'Clear definition of dumb UI libraries with zero state/service dependencies'
    ],
    codeExample: `// Enterprise Project Hierarchy
src/
├── app/
│   ├── app.config.ts
│   └── app.routes.ts
├── core/                   # Global singleton infrastructure
│   ├── auth/
│   │   ├── auth.guard.ts
│   │   └── auth.interceptor.ts
│   └── layout/
├── shared/                 # Generic reusable building blocks
│   ├── ui/                 # Dumb UI (Button, Modal, Table, Skeleton)
│   ├── utils/              # Pure functions (formatters, math)
│   └── pipes/
└── features/               # Domain Business Modules
    ├── cart/
    │   ├── data-access/    # CartService, CartStore, CartApi
    │   ├── ui/             # CartItemRowComponent, CartSummaryView
    │   ├── cart.routes.ts
    │   └── cart.component.ts # Smart Container
    └── checkout/`,
    tags: ['architecture', 'folder-structure', 'nx', 'monorepo', 'clean-architecture', 'enterprise']
  },
  {
    id: 'arch_02',
    category: 'architecture',
    topic: 'Micro-Frontends: Trade-offs & Implementation',
    difficulty: 'Senior',
    question: 'What are Micro-Frontends, what are the trade-offs, and how does Webpack/Vite Module Federation work for runtime integration?',
    shortAnswer: 'Micro-Frontends decompose a monolithic frontend into independent, autonomous sub-applications developed and deployed by separate teams. Module Federation enables a host application to dynamically import remote bundles at runtime while sharing common singleton dependencies (e.g. `@angular/core` or `react`). Trade-offs include increased operational complexity, governance overhead, bundle size duplication, and coordination challenges for global CSS and shared routing.',
    seniorPoint: 'Micro-frontends are an **organizational scaling solution**, NOT a technical optimization. If you have a single 5-person engineering team, micro-frontends will introduce immense friction without benefits. They become valuable when 10+ independent cross-functional squads need autonomous deployment cadences.',
    spokenTip: 'Micro-frontends solve team organizational bottlenecks at the expense of architectural complexity and runtime performance.',
    interviewAnswer: 'Micro-Frontends split a frontend into discrete web applications running under a common shell:\n- **Integration Patterns**:\n  1. *Build-time*: NPM packages (causes deployment lockstep; every change requires rebuilding the host).\n  2. *Runtime iframes*: Complete isolation, but terrible UX, broken modals, and heavy memory overhead.\n  3. *Runtime Module Federation*: The industry standard. Host downloads remote micro-app chunks on demand over HTTP.\n\n**Module Federation Features**:\n- Remotes expose modules (`exposes: { "./Header": "./src/Header.component.ts" }`).\n- Shell dynamically loads remotes.\n- `shared` config: Configures singletons (`react`, `@angular/core`, `rxjs`) to prevent downloading multiple framework instances.\n\n**Key Risks & Mitigations**:\n- CSS leakage (use Shadow DOM or strict Tailwind prefixes).\n- Shared state & routing (use URL query parameters or custom `window.dispatchEvent` custom events; avoid deep shared state).',
    keyPointsToMention: [
      'Organizational motivation: team autonomy and independent deployment cycles',
      'Module Federation runtime sharing and singleton dependency deduplication',
      'Trade-offs: bundle inflation, cross-app navigation coordination, styling collisions',
      'Communication strategies: CustomEvents, URL-first state, minimal shared bus'
    ],
    whatInterviewersLookFor: [
      'Realistic architectural skepticism (knowing when NOT to use micro-frontends)',
      'Understanding of dependency singleton management in Module Federation'
    ],
    codeExample: `// module-federation.config.ts in Shell Host App
import { withModuleFederation } from '@nx/angular/module-federation';

export default withModuleFederation({
  name: 'shell',
  remotes: [
    ['checkout', 'https://checkout.enterprise.com/remoteEntry.js'],
    ['billing', 'https://billing.enterprise.com/remoteEntry.js']
  ],
  shared: (libraryName, defaultConfig) => {
    // Ensure core framework packages are strictly singletons!
    if (['@angular/core', '@angular/common', '@angular/router', 'rxjs'].includes(libraryName)) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto'
      };
    }
    return defaultConfig;
  }
});`,
    tags: ['architecture', 'micro-frontends', 'module-federation', 'scaling', 'enterprise']
  },
  {
    id: 'arch_03',
    category: 'architecture',
    topic: 'API Abstraction & Runtime Type Validation',
    difficulty: 'Senior',
    question: 'How do you design a robust, resilient API abstraction layer with runtime schema validation (Zod/Valibot) and error normalization?',
    shortAnswer: 'Create a layered API client: 1) Base HTTP wrapper (handles headers, token injection, base URLs, timeout/cancellation); 2) Domain Repositories (exposes clean domain methods); 3) Runtime Schema Validation (validates unknown backend JSON against Zod schemas before reaching the UI); 4) Error Normalizer (maps HTTP 4xx/5xx, timeouts, and validation failures into unified `AppError` domain types).',
    seniorPoint: 'TypeScript types only exist at compile-time. If the backend silently changes a field name or returns `null` instead of an array, un-validated frontend code crashes with `Cannot read properties of undefined`. Runtime validation provides a bulletproof contract boundary.',
    spokenTip: 'Never trust external API responses directly; validate and normalize them at the application perimeter.',
    interviewAnswer: 'A mature API abstraction layer contains four distinct tiers:\n1. **Transport Layer**: Configures base URLs, interceptors, timeouts, and auth headers (via HttpClient / Axios / Fetch).\n2. **Schema Validation Layer (Perimeter)**: Passes untrusted response JSON through Zod (`UserSchema.parse(rawJson)`). If the payload violates the schema, it fails fast with descriptive logs instead of triggering mysterious UI bugs downstream.\n3. **Domain Entity Normalization**: Maps backend snake_case DTOs to frontend camelCase Domain models.\n4. **Unified Error Handling**: Transforms low-level network errors, HTTP status codes, and validation failures into strongly typed domain errors (`{ code: "NETWORK_TIMEOUT", message: "..." }`).',
    keyPointsToMention: [
      'Compile-time types vs runtime schema validation with Zod / Valibot',
      'DTO vs Domain Model separation',
      'Standardized Application Error model for UI error boundaries',
      'Cancellation token integration with AbortController'
    ],
    whatInterviewersLookFor: [
      'Understanding why TypeScript types alone do not protect against backend payload changes',
      'Demonstration of clean separation of concerns between HTTP transport and business logic'
    ],
    codeExample: `import { z } from 'zod';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// 1. Zod Runtime Schema
export const UserDtoSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  email_address: z.string().email(),
  is_active: z.boolean()
});

export type UserDomain = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

// 2. Domain Repository with runtime validation & mapping
@Injectable({ providedIn: 'root' })
export class UserRepository {
  private http = inject(HttpClient);

  getUser(id: string): Observable<UserDomain> {
    return this.http.get(\`/api/users/\${id}\`).pipe(
      map((rawJson) => {
        // Runtime schema validation
        const parsed = UserDtoSchema.parse(rawJson);
        // Domain model mapping
        return {
          id: parsed.user_id,
          name: parsed.full_name,
          email: parsed.email_address,
          isActive: parsed.is_active
        };
      })
    );
  }
}`,
    tags: ['architecture', 'api-design', 'zod', 'validation', 'repository-pattern', 'error-handling']
  }
];
