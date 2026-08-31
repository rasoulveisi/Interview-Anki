import { Question } from '../types';

export const performanceQuestions: Question[] = [
  {
    id: 'perf_01',
    category: 'performance',
    topic: 'Core Web Vitals (CWV) & Auditing',
    difficulty: 'Senior',
    question: 'What are Core Web Vitals (LCP, INP, CLS)? How do you audit, diagnose, and optimize each in an enterprise Single Page Application?',
    shortAnswer: 'Core Web Vitals are Google’s user-experience metrics: 1) **LCP (Largest Contentful Paint, <= 2.5s)**: Loading speed of main viewport content (hero image/h1). 2) **INP (Interaction to Next Paint, <= 200ms)**: Responsiveness to user clicks/keys (replaces FID). 3) **CLS (Cumulative Layout Shift, <= 0.1)**: Visual stability. Audit via Chrome DevTools Performance panel, PageSpeed Insights, and the `web-vitals` library.',
    interviewAnswer: 'Core Web Vitals measure real-world user experience across 3 pillars:\n1. **LCP (Largest Contentful Paint - target <= 2.5s)**:\n   - *Bottlenecks*: Slow server TTFB, render-blocking JS/CSS bundles, unoptimized hero images.\n   - *Fixes*: Use Server-Side Rendering (SSR) / Edge caching, add `<link rel="preload">` and `fetchpriority="high"` on hero images, and compress images with WebP/AVIF.\n2. **INP (Interaction to Next Paint - target <= 200ms)**:\n   - *Bottlenecks*: Long tasks (> 50ms) blocking the main thread during user clicks, heavy React/Angular state reconciliations.\n   - *Fixes*: Break long tasks using `scheduler.yield()` or `setTimeout`, offload calculations to Web Workers, and use `useTransition` / Signals.\n3. **CLS (Cumulative Layout Shift - target <= 0.1)**:\n   - *Bottlenecks*: Images or ads loading without explicit dimensions, dynamic content inserted above existing content, FOIT/FOUT web fonts.\n   - *Fixes*: Always set `width` and `height` attributes or CSS `aspect-ratio` on images, use `font-display: swap` with size-adjust fallbacks, and use skeleton loaders with reserved dimensions.',
    spokenTip: 'LCP measures loading of main content, INP measures click responsiveness by breaking long tasks, and CLS measures visual stability with reserved dimensions.',
    example: {
      language: 'html',
      code: `<!-- 1. LCP Optimization: High-priority preloaded hero image -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />

<img 
  src="/hero.webp" 
  alt="Main Dashboard Banner" 
  width="1200" 
  height="600" 
  fetchpriority="high" 
  decoding="async" 
/>

<!-- 2. CLS Prevention: Reserve layout box with CSS aspect-ratio -->
<style>
  .ad-slot {
    width: 100%;
    aspect-ratio: 16 / 9; /* Prevents layout shift when ad finishes loading! */
    background-color: #f3f4f6;
  }
</style>`,
      explanation: 'Optimizes LCP with fetchpriority="high" and prevents CLS with explicit aspect-ratio.'
    },
    seniorPoint: 'INP measures all interactions across the full page lifecycle, taking the worst 98th-percentile interaction delay. Unlike legacy FID (which only measured the very first click), INP catches laggy dropdowns, slow autocomplete inputs, and stuttering filter tabs throughout the session.',
    followUps: [
      {
        question: 'How do you break up a long JavaScript task to optimize INP in modern browsers?',
        answer: 'Use `await scheduler.yield()` (or fallback to `new Promise(resolve => setTimeout(resolve, 0))`) inside long computation loops to yield the main thread back to the browser for rendering and input handling.'
      },
      {
        question: 'What is the difference between Lab Data (Lighthouse) and Field Data (CrUX)?',
        answer: 'Lab data is collected on simulated throttling in a clean environment. Field data (Chrome User Experience Report) is collected from real users on diverse devices, network conditions, and interactions, and directly impacts Google search rankings.'
      }
    ],
    keyPointsToMention: [
      'LCP (<=2.5s), INP (<=200ms, replaces FID), CLS (<=0.1)',
      'LCP fixes: fetchpriority="high", preloading, modern image formats (AVIF/WebP), SSR',
      'INP fixes: break long tasks (>50ms) via scheduler.yield(), offload to Web Workers',
      'CLS fixes: aspect-ratio on images/ads, skeleton dimensions, font-display: swap'
    ],
    tags: ['performance', 'core-web-vitals', 'lcp', 'inp', 'cls', 'lighthouse', 'optimization']
  },
  {
    id: 'perf_02',
    category: 'performance',
    topic: 'Virtual Scrolling & Windowing',
    difficulty: 'Senior',
    question: 'How does Virtual Scrolling (Windowing) render 100,000 records smoothly? Explain viewport math, spacer offsets, and dynamic item heights.',
    shortAnswer: 'Virtual scrolling renders only the small subset of DOM items currently visible in the scroll viewport (~20-40 elements) plus a small overscan buffer. It creates top and bottom spacer padding (or a `transform: translateY()`) to simulate the full scrollbar height, keeping memory low and DOM nodes constant regardless of list size.',
    interviewAnswer: 'Rendering 100,000 DOM elements causes browser tabs to crash due to massive memory allocations and seconds-long layout calculations.\n\n**Virtual Scrolling Architecture**:\n1. **Viewport Calculation**: An outer container with `overflow-y: auto` listens to `scroll` events.\n2. **Index Math**: Given total items $N$ and item height $H$:\n   - Total Scrollable Height = $N \\times H$\n   - First Visible Index = $\\lfloor \\text{scrollTop} / H \\rfloor$\n   - Visible Count = $\\lceil \\text{viewportHeight} / H \\rceil$\n   - Overscan: Add 3-5 buffer items above and below to prevent blank flickering during fast scrolls.\n3. **DOM Virtualization**: Only the 30 active items are rendered into the DOM. An absolute `transform: translateY(firstIndex * itemHeight)` or top spacer padding offsets the items to their exact scroll position.\n4. **Dynamic Item Heights**: Use a binary search tree or index map to cache measured DOM heights dynamically via `ResizeObserver`.',
    spokenTip: 'Virtual scrolling renders only visible items plus an overscan buffer, using CSS transform offsets to simulate full scrollbar height.',
    example: {
      language: 'typescript',
      code: `import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-virtual-list',
  standalone: true,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <!-- Angular CDK Virtual Scroll Viewport -->
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items(); trackBy: trackById" class="item-row">
        <span>#{{ item.id }}</span> - <span>{{ item.name }}</span>
      </div>
    </cdk-virtual-scroll-viewport>
  \`,
  styles: [\`
    .viewport { height: 400px; width: 100%; border: 1px solid #ccc; }
    .item-row { height: 50px; display: flex; align-items: center; padding: 0 16px; }
  \`]
})
export class VirtualListComponent {
  // 100,000 records handled with zero DOM lag!
  items = signal(Array.from({ length: 100000 }, (_, i) => ({ id: i, name: \`Customer \${i}\` })));
  trackById = (index: number, item: any) => item.id;
}`,
      explanation: 'Uses Angular CDK Virtual Scroll Viewport to render 100k items maintaining ~30 active DOM nodes.'
    },
    seniorPoint: 'Ensure you apply `contain: strict` (or `contain: layout size`) on the virtual scroll container in CSS. This isolates layout recalculations inside the container, preventing list scrolls from triggering global page reflows.',
    followUps: [
      {
        question: 'What is the purpose of the overscan / buffer parameter in virtual scrolling?',
        answer: 'Overscan renders a few extra items just outside the visible viewport boundary so that fast scrolling does not expose brief blank flashes before new items mount.'
      },
      {
        question: 'How do you handle keyboard navigation and accessibility in a virtualized list?',
        answer: 'Manage focus with `aria-activedescendant` on the container or automatically programmatically scroll the viewport (`scrollToIndex`) when the user presses ArrowUp or ArrowDown.'
      }
    ],
    keyPointsToMention: [
      'Concept: rendering only visible viewport items (~30 DOM nodes) regardless of list size',
      'Mathematical formulas for start index, end index, and translateY transform offset',
      'Overscan buffer for smooth scrolling',
      'Dynamic height challenges solved via ResizeObserver size caching'
    ],
    tags: ['performance', 'virtual-scrolling', 'cdk', 'windowing', 'dom-optimization', 'angular']
  },
  {
    id: 'perf_03',
    category: 'performance',
    topic: 'Bundle Optimization & Tree-Shaking',
    difficulty: 'Senior',
    question: 'How do modern bundlers perform Tree-Shaking? Explain `"sideEffects": false`, Barrel File traps, and Dynamic Imports.',
    shortAnswer: 'Tree-shaking relies on static ES Module (`import`/`export`) analysis to eliminate dead code. `"sideEffects": false` in `package.json` tells bundlers that unused module exports can be safely pruned without executing initialization code. **Barrel files (`index.ts`)** can accidentally pull in massive circular dependency graphs if not configured properly.',
    interviewAnswer: "Modern bundlers (Webpack, Rollup, Vite/esbuild) optimize production bundles through static analysis:\n1. **ESM Static Analysis**: Unlike CommonJS `require()`, ES6 `import`/`export` syntax is strictly static. The bundler builds an Abstract Syntax Tree (AST) and traces all reachable symbols from the entry point.\n2. **`\"sideEffects\": false` in `package.json`**: By default, bundlers assume importing a file might execute global side-effects (like modifying `window` or polyfilling prototypes). Declaring `\"sideEffects\": false` (or an array of paths) gives the bundler permission to skip unused files completely.\n3. **The Barrel File Trap (`index.ts`)**: Re-exporting 50 components from an `index.ts` barrel file can cause the bundler to load and parse all 50 files when a component only imports one icon, slowing down dev builds and ballooning bundle size.\n4. **Dynamic Imports (`import(\\'./widget\\')`)**: Creates separate async chunks loaded on demand via code splitting (e.g. route-level lazy loading and Angular `@defer`).",
    spokenTip: 'Tree-shaking removes unused code using static ESM analysis and "sideEffects": false. Avoid massive barrel files that pull in unwanted modules.',
    example: {
      language: 'json',
      code: `// package.json: Enabling aggressive tree-shaking
{
  "name": "my-ui-library",
  "version": "1.0.0",
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.ts"
  ]
}

// Dynamic Import (Code Splitting in TypeScript / Angular / React)
async function openHeavyExportModal() {
  // Lazy loads the 500KB XLSX library ONLY when the user clicks Export!
  const { exportToExcel } = await import('./excel-exporter');
  exportToExcel(this.dataset);
}`,
      explanation: 'Configuring package.json sideEffects and dynamic runtime imports for code splitting.'
    },
    seniorPoint: 'Common tree-shaking killer: Top-level function calls (like `export const defaultClient = createApiClient();`). Even if `defaultClient` is never imported, the bundler cannot prove `createApiClient()` is pure and must retain it unless annotated with `/* @__PURE__ */`.',
    followUps: [
      {
        question: 'What does the `/* @__PURE__ */` comment tell the minifier?',
        answer: 'It instructs tools like Terser and esbuild that the function call has no side effects, allowing the bundler to safely drop the assignment if the variable is unused.'
      },
      {
        question: 'Why does CommonJS (`require()`) prevent effective tree-shaking?',
        answer: 'CommonJS imports and exports are dynamic and evaluated at runtime (e.g. `if (condition) require(...)`), making it impossible for the bundler to statically guarantee which exports are unused at compile-time.'
      }
    ],
    keyPointsToMention: [
      'Static ESM (import/export) requirements for tree-shaking vs CommonJS limitations',
      '"sideEffects": false in package.json to prune unreferenced modules',
      'Barrel file (index.ts) bundling pitfalls and import bloat',
      '/* @__PURE__ */ annotations on top-level function calls',
      'Dynamic imports (import()) for route and component code-splitting'
    ],
    tags: ['performance', 'tree-shaking', 'bundling', 'vite', 'webpack', 'code-splitting']
  },
  {
    id: 'perf_04',
    category: 'performance',
    topic: 'Memory Leaks & Chrome DevTools Heap Profiling',
    difficulty: 'Senior',
    question: 'How do you detect and fix Memory Leaks in a Single Page Application? Walk through taking Heap Snapshots, finding Detached DOM Trees, and analyzing Retaining Paths.',
    shortAnswer: 'Take three successive Heap Snapshots in Chrome DevTools: 1) Baseline, 2) After performing user action, 3) After closing/navigating away. Filter by "Objects allocated between Snapshot 1 and 2" or search for `Detached` to find detached HTML elements. Follow the **Retainer Path** from the detached element up to the root window/closure to identify the exact uncleaned event listener, subscription, or global array keeping it alive.',
    interviewAnswer: 'In single-page applications that run for hours without full page reloads, memory leaks degrade browser responsiveness and eventually cause tab crashes:\n\n1. **Detached DOM Tree**: Occurs when a component is unmounted and removed from the DOM tree, but a JavaScript reference (e.g. an uncancelled `addEventListener`, RxJS subscription, or global array) still holds a pointer to an element inside it. The entire DOM subtree stays pinned in browser RAM.\n2. **Diagnostic Workflow in Chrome DevTools**:\n   - Open DevTools -> **Memory** tab -> Select **Heap snapshot**.\n   - Take Snapshot 1 (baseline) -> Open a modal/feature -> Close the modal -> Take Snapshot 2.\n   - Filter class filter by `Detached` (e.g. `Detached HTMLDivElement`).\n   - Click the detached node and inspect the bottom **Retainers** panel. Trace the yellow/red references to find the exact variable or closure retaining the object.\n3. **Resolution**: Unregister native listeners in teardown, use `takeUntilDestroyed()`, disconnect `ResizeObserver`/`IntersectionObserver` instances, and clear global cache maps.',
    spokenTip: 'Take before-and-after heap snapshots, search for "Detached" elements, and follow the Retainer tree up to the uncleaned listener or subscription.',
    example: {
      language: 'typescript',
      code: `// ❌ LEAK: Global array retains destroyed component instance
const telemetryQueue: Array<() => void> = [];

export class LeakingModalComponent implements OnInit {
  ngOnInit() {
    // Closure captures 'this' (the component instance!) indefinitely
    telemetryQueue.push(() => this.sendAnalytics());
  }
}

// ✅ FIXED: Clean up callback or use WeakRef
export class CleanModalComponent implements OnInit, OnDestroy {
  private handler = () => this.sendAnalytics();

  ngOnInit() {
    telemetryQueue.push(this.handler);
  }

  ngOnDestroy() {
    const idx = telemetryQueue.indexOf(this.handler);
    if (idx !== -1) telemetryQueue.splice(idx, 1);
  }
}`,
      explanation: 'Shows closure retention leak in global arrays and proper teardown in ngOnDestroy.'
    },
    seniorPoint: 'Understand **Shallow Size vs Retained Size**: Shallow Size is the memory held by the object itself (primitive fields). Retained Size is the total memory that will be freed automatically once the object is garbage collected. Look for objects with huge Retained Size in heap snapshots.',
    followUps: [
      {
        question: 'What is the purpose of `WeakMap` and `WeakSet` in preventing memory leaks?',
        answer: '`WeakMap` holds weak references to its key objects. If no other references to the key object exist, the entry is automatically garbage collected without manual deletion.'
      },
      {
        question: 'Why do detached DOM nodes consume significantly more memory than plain JavaScript objects?',
        answer: 'Because a detached DOM element retains its entire subtree, native C++ DOM bindings, computed style trees, and attached event listener tables in browser memory.'
      }
    ],
    keyPointsToMention: [
      'Detached DOM nodes: elements removed from DOM but held by JS closures/listeners',
      'Heap snapshot diagnostic procedure (Snapshot 1 baseline -> Action -> Snapshot 2 compare)',
      'Retainers panel inspection to trace root holding path',
      'Shallow Size vs Retained Size'
    ],
    tags: ['performance', 'memory-leaks', 'heap-snapshot', 'devtools', 'profiling', 'garbage-collection']
  },
  {
    id: 'perf_05',
    category: 'performance',
    topic: 'Web Workers & Main Thread Offloading',
    difficulty: 'Senior',
    question: 'How do Web Workers achieve zero-lag UI responsiveness for heavy client-side computations? What are the limitations and communication trade-offs?',
    shortAnswer: 'Web Workers run JavaScript on a separate OS background thread, keeping the main thread free for 60fps rendering, smooth scrolling, and instant user input handling (INP < 50ms). They communicate with the main thread via asynchronous message passing (`postMessage` / `Structured Clone` or `SharedArrayBuffer`). They cannot access the DOM or `window` directly.',
    interviewAnswer: 'The browser runs JavaScript, layout, and painting on a single Main Thread. Any CPU computation taking over 50ms (e.g. client-side Excel CSV parsing, image resizing/filtering, client-side vector search, cryptography) freezes the UI, causing jank and failing INP.\n\n**Web Worker Architecture**:\n1. **Thread Isolation**: The worker operates in its own execution context (`DedicatedWorkerGlobalScope`). It has access to `fetch`, `IndexedDB`, and `WebSockets`, but **no access to the DOM, `document`, or `window`**.\n2. **Data Transfer Performance**:\n   - *Structured Clone*: Default `postMessage(data)` clones data via serialization, adding minor latency for large objects.\n   - *Transferable Objects*: By transferring ownership of an `ArrayBuffer` (`postMessage(buffer, [buffer])`), data is moved with **zero copy and zero latency ($O(1)$ transfer)**.\n3. **Modern DX (Comlink)**: Libraries like Google\'s `Comlink` use `Proxy` objects to expose worker functions as simple async Promise calls on the main thread.',
    spokenTip: 'Offload heavy computations (>50ms) to Web Workers using Transferable Objects or Comlink so your main UI thread never drops below 60fps.',
    example: {
      language: 'typescript',
      code: `// 1. worker.ts (Runs on background thread)
self.onmessage = (event: MessageEvent<ArrayBuffer>) => {
  const dataView = new Uint8Array(event.data);
  // Perform heavy image processing / crypto hashing...
  for (let i = 0; i < dataView.length; i++) {
    dataView[i] = dataView[i] ^ 0xFF; // Invert pixels
  }
  // Zero-copy transfer back to main thread
  self.postMessage(event.data, [event.data]);
};

// 2. main.ts (Main UI thread)
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

function processHeavyData(buffer: ArrayBuffer) {
  // Transfer buffer ownership to worker with 0ms copy overhead!
  worker.postMessage(buffer, [buffer]);

  worker.onmessage = (event) => {
    console.log('Processed buffer received without blocking main UI thread!');
    renderImage(event.data);
  };
}`,
      explanation: 'Uses Web Worker with Transferable Objects for zero-copy background data processing.'
    },
    seniorPoint: 'Web Workers have an initialization overhead (~10ms-30ms to boot the worker thread). Do not spin up and destroy workers for micro-tasks; keep a persistent worker pool for background tasks.',
    followUps: [
      {
        question: 'What is the difference between Web Workers and Service Workers?',
        answer: 'Web Workers are dedicated background threads for heavy computations. Service Workers are event-driven network proxies that intercept HTTP requests and manage caching offline.'
      },
      {
        question: 'How does `SharedArrayBuffer` with `Atomics` differ from standard `postMessage`?',
        answer: '`SharedArrayBuffer` allows the main thread and worker to read/write the exact same shared memory address simultaneously without message passing, using `Atomics` for thread-safe lock synchronization.'
      }
    ],
    keyPointsToMention: [
      'Main thread protection: keeping long tasks (<50ms) off the main thread to optimize INP',
      'No DOM / window access inside worker scope',
      'Data transfer mechanisms: Structured Clone (copy) vs Transferable Objects (zero-copy)',
      'Worker pools and Comlink RPC abstraction'
    ],
    tags: ['performance', 'web-workers', 'multithreading', 'inp', 'transferable-objects', 'comlink']
  }
];
