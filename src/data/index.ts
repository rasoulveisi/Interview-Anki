import { CategoryId, CategoryMeta, Question } from '../types';

// Backend / Full-Stack Question Decks
import { webQuestions } from './webQuestions';
import { dotNetQuestions } from './dotNetQuestions';
import { efCoreQuestions } from './efCoreQuestions';
import { sqlQuestions } from './sqlQuestions';
import { apiDesignQuestions } from './apiDesignQuestions';
import { microservicesQuestions } from './microservicesQuestions';
import { systemDesignQuestions } from './systemDesignQuestions';
import { scenariosQuestions } from './scenariosQuestions';

// Frontend Mastery Question Decks
import { javascriptQuestions } from './javascriptQuestions';
import { typeScriptQuestions } from './typeScriptQuestions';
import { angularQuestions } from './angularQuestions';
import { rxjsQuestions } from './rxjsQuestions';
import { stateManagementQuestions } from './stateManagementQuestions';
import { htmlCssQuestions } from './htmlCssQuestions';
import { browserQuestions } from './browserQuestions';
import { performanceQuestions } from './performanceQuestions';
import { architectureQuestions } from './architectureQuestions';
import { securityQuestions } from './securityQuestions';
import { testingQuestions } from './testingQuestions';
import { patternsQuestions } from './patternsQuestions';
import { a11yQuestions } from './a11yQuestions';
import { toolingQuestions } from './toolingQuestions';
import { gitWorkflowQuestions } from './gitWorkflowQuestions';
import { feSystemDesignQuestions } from './feSystemDesignQuestions';
import { feScenariosQuestions } from './feScenariosQuestions';
import { reactCoreQuestions } from './reactCoreQuestions';
import { reactAdvancedQuestions } from './reactAdvancedQuestions';

export const categoriesMeta: Record<CategoryId, CategoryMeta> = {
  // --- FRONTEND INTERVIEW DECKS ---
  javascript: {
    id: 'javascript',
    name: 'JavaScript Core & Deep Dive',
    shortName: 'JavaScript',
    iconName: 'FileCode',
    description: 'Scope, Closures, Event Loop, Microtasks/Macrotasks, Prototypes, Execution Context, this, Promises, and Concurrency.',
    color: 'amber',
    accentBg: 'bg-amber-500/10 text-amber-400',
    borderColor: 'border-amber-500/30'
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript Mastery',
    shortName: 'TypeScript',
    iconName: 'FileCode2',
    description: 'Type inference, Interfaces vs Types, Generics, any/unknown/never, Type Guards, Discriminated Unions, and Utility Types.',
    color: 'blue',
    accentBg: 'bg-blue-500/10 text-blue-400',
    borderColor: 'border-blue-500/30'
  },
  angular: {
    id: 'angular',
    name: 'Angular — Modern & Deep Dive',
    shortName: 'Angular',
    iconName: 'Boxes',
    description: 'Signals, @defer, Change Detection & OnPush, DI Injector Hierarchy, Typed Forms, HTTP Interceptors, and Zoneless.',
    color: 'red',
    accentBg: 'bg-red-500/10 text-red-400',
    borderColor: 'border-red-500/30'
  },
  rxjs: {
    id: 'rxjs',
    name: 'RxJS Reactive Programming',
    shortName: 'RxJS',
    iconName: 'GitMerge',
    description: 'Observables, Subjects, Higher-order operators (switchMap/mergeMap/concatMap/exhaustMap), Combinators, and Leak Prevention.',
    color: 'pink',
    accentBg: 'bg-pink-500/10 text-pink-400',
    borderColor: 'border-pink-500/30'
  },
  statemanagement: {
    id: 'statemanagement',
    name: 'State Management & NgRx',
    shortName: 'State Management',
    iconName: 'Layers',
    description: 'Local vs Global state, NgRx Store, Selectors, Effects, Entity Adapters, NgRx SignalStore, and Normalization.',
    color: 'purple',
    accentBg: 'bg-purple-500/10 text-purple-400',
    borderColor: 'border-purple-500/30'
  },
  htmlcss: {
    id: 'htmlcss',
    name: 'HTML5 & Modern CSS',
    shortName: 'HTML & CSS',
    iconName: 'Palette',
    description: 'Semantic HTML, Box Model, Stacking Context & z-index, Flexbox vs Grid, Container Queries, Cascade Layers, and Specificity.',
    color: 'orange',
    accentBg: 'bg-orange-500/10 text-orange-400',
    borderColor: 'border-orange-500/30'
  },
  browser: {
    id: 'browser',
    name: 'Web Browser Fundamentals',
    shortName: 'Browser Internals',
    iconName: 'Globe',
    description: 'Critical Rendering Path, Layout Thrashing, Reflow/Repaint, Web Workers, Service Workers, IndexedDB, and SOP/CORS.',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10 text-cyan-400',
    borderColor: 'border-cyan-500/30'
  },
  performance: {
    id: 'performance',
    name: 'Frontend Performance & Vitals',
    shortName: 'Performance',
    iconName: 'Zap',
    description: 'Core Web Vitals (LCP, INP, CLS), Virtual Scrolling 100k items, Tree Shaking, Bundle Optimization, and Code Splitting.',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10 text-emerald-400',
    borderColor: 'border-emerald-500/30'
  },
  architecture: {
    id: 'architecture',
    name: 'Frontend Architecture & Clean Code',
    shortName: 'Architecture',
    iconName: 'LayoutGrid',
    description: 'Feature-based architecture, Nx Monorepos, Micro-Frontends Module Federation, API abstraction, and Zod validation.',
    color: 'indigo',
    accentBg: 'bg-indigo-500/10 text-indigo-400',
    borderColor: 'border-indigo-500/30'
  },
  security: {
    id: 'security',
    name: 'Frontend Security & Auth',
    shortName: 'Security',
    iconName: 'ShieldCheck',
    description: 'XSS Defense, CSRF, CSP, DomSanitizer, Secure Cookie JWT Storage, and Frontend vs Backend Authorization.',
    color: 'rose',
    accentBg: 'bg-rose-500/10 text-rose-400',
    borderColor: 'border-rose-500/30'
  },
  testing: {
    id: 'testing',
    name: 'Testing & Quality Assurance',
    shortName: 'Testing',
    iconName: 'CheckCircle',
    description: 'Unit testing, TestBed, HttpTestingController, fakeAsync, Signals testing, Marble testing, and over-mocking pitfalls.',
    color: 'teal',
    accentBg: 'bg-teal-500/10 text-teal-400',
    borderColor: 'border-teal-500/30'
  },
  patterns: {
    id: 'patterns',
    name: 'Frontend Design Patterns',
    shortName: 'Design Patterns',
    iconName: 'Sparkles',
    description: 'Facade, Adapter, Strategy, State Machines (FSM), Observer, and Compound Component Patterns with practical TS examples.',
    color: 'violet',
    accentBg: 'bg-violet-500/10 text-violet-400',
    borderColor: 'border-violet-500/30'
  },
  a11y: {
    id: 'a11y',
    name: 'Accessibility (a11y) & WCAG',
    shortName: 'Accessibility',
    iconName: 'Eye',
    description: 'Accessible modal focus traps, keyboard navigation, aria-live, aria-describedby, screen readers, and WCAG AA standards.',
    color: 'lime',
    accentBg: 'bg-lime-500/10 text-lime-400',
    borderColor: 'border-lime-500/30'
  },
  tooling: {
    id: 'tooling',
    name: 'Build, Tooling & Bundlers',
    shortName: 'Build & Tooling',
    iconName: 'Cpu',
    description: 'Vite vs Webpack vs esbuild, native ESM dev server, SemVer, npm ci, peerDependencies, and CI/CD pipelines.',
    color: 'sky',
    accentBg: 'bg-sky-500/10 text-sky-400',
    borderColor: 'border-sky-500/30'
  },
  gitworkflow: {
    id: 'gitworkflow',
    name: 'Git & Engineering Workflow',
    shortName: 'Git Workflow',
    iconName: 'GitBranch',
    description: 'Trunk-Based vs GitFlow, Merge vs Rebase, Conventional Commits, Husky, lint-staged, and automated SemVer release.',
    color: 'amber',
    accentBg: 'bg-amber-500/10 text-amber-400',
    borderColor: 'border-amber-500/30'
  },
  fesystemdesign: {
    id: 'fesystemdesign',
    name: 'Frontend System Design',
    shortName: 'FE System Design',
    iconName: 'Network',
    description: 'Real-time telemetry dashboards (500Hz), Autocomplete search systems, 1M row virtual tables, and multi-file resumable uploaders.',
    color: 'fuchsia',
    accentBg: 'bg-fuchsia-500/10 text-fuchsia-400',
    borderColor: 'border-fuchsia-500/30'
  },
  fescenarios: {
    id: 'fescenarios',
    name: 'Frontend Real Scenarios & Triage',
    shortName: 'FE Live Scenarios',
    iconName: 'AlertCircle',
    description: 'Stale search race conditions, 10k row slow page optimization, Chrome DevTools memory leak triage, and 401 token refresh queueing.',
    color: 'red',
    accentBg: 'bg-red-500/10 text-red-400',
    borderColor: 'border-red-500/30'
  },
  reactcore: {
    id: 'reactcore',
    name: 'React.js — Core & Fundamentals',
    shortName: 'React Core',
    iconName: 'Atom',
    description: 'React philosophy vs Angular, JSX, Virtual DOM/Reconciliation, useEffect/useLayoutEffect/useRef, list keys, and hooks.',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10 text-cyan-400',
    borderColor: 'border-cyan-500/30'
  },
  reactadvanced: {
    id: 'reactadvanced',
    name: 'React.js — Advanced & Scenarios',
    shortName: 'React Advanced',
    iconName: 'Flame',
    description: 'TanStack Query (Server State) vs Zustand, React Server Components (RSC), Next.js App Router, re-render elimination, and scenarios.',
    color: 'blue',
    accentBg: 'bg-blue-500/10 text-blue-400',
    borderColor: 'border-blue-500/30'
  },

  // --- FULL-STACK / BACKEND DECKS ---
  web: {
    id: 'web',
    name: 'Web / HTTP / REST',
    shortName: 'Web & REST',
    iconName: 'Globe',
    description: 'HTTP methods, headers, status codes, cookies/sessions, HTTPS/TLS, HTTP versions, REST semantics, CORS, and pagination.',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10 text-emerald-400',
    borderColor: 'border-emerald-500/30'
  },
  dotnet: {
    id: 'dotnet',
    name: '.NET / ASP.NET Core',
    shortName: 'ASP.NET Core',
    iconName: 'Cpu',
    description: 'Request pipeline, middleware, DI lifetimes, async/await, thread pool, exception handling, JWT auth, and options pattern.',
    color: 'indigo',
    accentBg: 'bg-indigo-500/10 text-indigo-400',
    borderColor: 'border-indigo-500/30'
  },
  efcore: {
    id: 'efcore',
    name: 'EF Core',
    shortName: 'EF Core',
    iconName: 'Layers',
    description: 'DbContext, LINQ IQueryable vs IEnumerable, Change Tracking, AsNoTracking, Eager/Lazy loading, N+1 problem, and Dapper.',
    color: 'violet',
    accentBg: 'bg-violet-500/10 text-violet-400',
    borderColor: 'border-violet-500/30'
  },
  sql: {
    id: 'sql',
    name: 'SQL / Database',
    shortName: 'SQL & Database',
    iconName: 'Database',
    description: 'Indexes (clustered vs non-clustered), JOINs, ACID properties, isolation levels, execution plans, and deadlocks.',
    color: 'amber',
    accentBg: 'bg-amber-500/10 text-amber-400',
    borderColor: 'border-amber-500/30'
  },
  apidesign: {
    id: 'apidesign',
    name: 'API Design',
    shortName: 'API Design',
    iconName: 'Code2',
    description: 'Resource-oriented APIs, versioning, DTOs, ProblemDetails error formats, rate limiting, and payment idempotency.',
    color: 'sky',
    accentBg: 'bg-sky-500/10 text-sky-400',
    borderColor: 'border-sky-500/30'
  },
  microservices: {
    id: 'microservices',
    name: 'Microservices',
    shortName: 'Microservices',
    iconName: 'Boxes',
    description: 'Monolith vs Microservices, sync vs async messaging (RabbitMQ/Kafka), Circuit Breaker, Saga pattern, and Outbox pattern.',
    color: 'rose',
    accentBg: 'bg-rose-500/10 text-rose-400',
    borderColor: 'border-rose-500/30'
  },
  systemdesign: {
    id: 'systemdesign',
    name: 'System Design',
    shortName: 'System Design',
    iconName: 'LayoutGrid',
    description: 'Practical architectures: E-commerce, Search/Autocomplete, Real-Time Telemetry Dashboard, File Upload, and Full-Stack Scale.',
    color: 'fuchsia',
    accentBg: 'bg-fuchsia-500/10 text-fuchsia-400',
    borderColor: 'border-fuchsia-500/30'
  },
  scenarios: {
    id: 'scenarios',
    name: 'Real Scenarios & Triage',
    shortName: 'Live Scenarios',
    iconName: 'Sparkles',
    description: 'Cross-stack troubleshooting: Angular search debouncing, 5s latency investigation, frontend vs backend debate, and outage fallbacks.',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10 text-cyan-400',
    borderColor: 'border-cyan-500/30'
  }
};

export const allQuestions: Question[] = [
  // Frontend Mastery Questions
  ...javascriptQuestions,
  ...typeScriptQuestions,
  ...angularQuestions,
  ...rxjsQuestions,
  ...stateManagementQuestions,
  ...htmlCssQuestions,
  ...browserQuestions,
  ...performanceQuestions,
  ...architectureQuestions,
  ...securityQuestions,
  ...testingQuestions,
  ...patternsQuestions,
  ...a11yQuestions,
  ...toolingQuestions,
  ...gitWorkflowQuestions,
  ...feSystemDesignQuestions,
  ...feScenariosQuestions,
  ...reactCoreQuestions,
  ...reactAdvancedQuestions,

  // Full-Stack Questions
  ...webQuestions,
  ...dotNetQuestions,
  ...efCoreQuestions,
  ...sqlQuestions,
  ...apiDesignQuestions,
  ...microservicesQuestions,
  ...systemDesignQuestions,
  ...scenariosQuestions
];

export function getQuestionsByCategory(categoryId: CategoryId): Question[] {
  return allQuestions.filter(q => q.category === categoryId);
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find(q => q.id === id);
}

export function searchQuestions(query: string): Question[] {
  if (!query.trim()) return allQuestions;
  const q = query.toLowerCase().trim();
  return allQuestions.filter(item => 
    item.question.toLowerCase().includes(q) ||
    item.shortAnswer.toLowerCase().includes(q) ||
    (item.interviewAnswer && item.interviewAnswer.toLowerCase().includes(q)) ||
    (item.topic && item.topic.toLowerCase().includes(q)) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q))) ||
    (item.seniorPoint && item.seniorPoint.toLowerCase().includes(q))
  );
}
