import { Question } from '../types';

export const performanceQuestions: Question[] = [
  {
    id: 'perf_01',
    category: 'performance',
    topic: 'Core Web Vitals',
    difficulty: 'Senior',
    question: 'Explain the Core Web Vitals: LCP, INP (replacing FID), and CLS. What are their targets, common culprits, and step-by-step remediation strategies?',
    shortAnswer: '1) **LCP (Largest Contentful Paint)**: Render time of the largest visible hero image/text block (Target: < 2.5s). Optimize via CDN, `fetchpriority="high"`, server-side rendering, and image modern formats (AVIF/WebP). 2) **INP (Interaction to Next Paint)**: Measures user responsiveness across all clicks/keystrokes (Target: < 200ms). Fix by eliminating long tasks (>50ms) and offloading to Web Workers. 3) **CLS (Cumulative Layout Shift)**: Measures unexpected visual shifting during page load (Target: < 0.1). Fix by declaring explicit `width`/`height` and `aspect-ratio` on media, and reserving slot space for ads/dynamic content.',
    seniorPoint: 'INP measures the 98th percentile of all user interactions across the entire session, not just the first input. Any long synchronous script execution on the main thread will degrade INP.',
    spokenTip: 'LCP is loading speed; INP is interactive responsiveness; CLS is visual layout stability.',
    interviewAnswer: 'Google\'s Core Web Vitals benchmarks:\n- **LCP (< 2.5s)**: Measures perceived load speed. Culprits: slow server TTFB, render-blocking JavaScript/CSS, and un-optimized hero images. Solutions: Compress images to WebP/AVIF, use `<link rel="preload" as="image" href="..." fetchpriority="high">`, optimize critical CSS, and enable HTTP/3 on CDN.\n- **INP (< 200ms)**: Replaced First Input Delay (FID) in 2024. Measures latency between user click/tap/keypress and the visual screen update. Culprits: large JS execution blocks (>50ms long tasks) blocking the event loop. Solutions: Break long tasks using `scheduler.yield()` or `setTimeout()`, debounce high-frequency inputs, and offload CPU calculations to Web Workers.\n- **CLS (< 0.1)**: Measures visual layout shifts. Culprits: images/videos without dimensions, dynamic client-side banner injection, and FOIT/FOUT web font swaps. Solutions: Always set CSS `aspect-ratio` or explicit HTML `width` and `height`, reserve placeholder skeleton containers, and use `font-display: optional` or `swap` with size-adjusted fallback fonts.',
    keyPointsToMention: [
      'LCP < 2.5s, INP < 200ms, CLS < 0.1',
      'INP covers all session interactions at the 98th percentile',
      'CLS fixed via explicit image dimensions, aspect-ratio, and reserving layout space',
      'LCP boosted by fetchpriority="high", preloading hero assets, and optimizing server TTFB'
    ],
    whatInterviewersLookFor: [
      'Awareness that INP replaced FID and why (full session tracking vs first interaction only)',
      'Specific HTML and CSS attributes: fetchpriority="high", aspect-ratio, font-display: optional'
    ],
    codeExample: `<!-- 1. Optimize LCP: High Priority Preload for Hero Banner -->
<link rel="preload" as="image" href="/assets/hero.avif" fetchpriority="high" />

<!-- 2. Zero-CLS Responsive Image Container -->
<img 
  src="/assets/hero.avif" 
  alt="Dashboard Hero"
  width="1200" 
  height="600"
  fetchpriority="high"
  style="width: 100%; height: auto; aspect-ratio: 16 / 9;"
/>

<!-- 3. Optimize INP: Break Long Tasks using scheduler.yield() -->
async function processLargeDataset(items: DataItem[]) {
  for (let i = 0; i < items.length; i++) {
    heavyCalculation(items[i]);
    // Yield main thread every 50 items so the browser can paint & handle user input
    if (i % 50 === 0 && 'scheduler' in window) {
      await (window as any).scheduler.yield();
    }
  }
}`,
    tags: ['performance', 'core-web-vitals', 'lcp', 'inp', 'cls', 'optimization']
  },
  {
    id: 'perf_02',
    category: 'performance',
    topic: 'Virtual Scrolling & 100k Records',
    difficulty: 'Senior',
    question: 'How does Virtual Scrolling (Windowing) work under the hood, and how do you render 100,000 table rows smoothly at 60fps?',
    shortAnswer: 'Virtual scrolling only renders the slice of DOM nodes currently visible in the viewport plus a small overscan buffer (e.g. 20–30 nodes instead of 100,000). As the user scrolls, it dynamically calculates row offsets, recycles DOM elements or swaps their data, and uses a top/bottom spacer or transform to simulate the full scroll height.',
    seniorPoint: 'Rendering 10,000 real DOM nodes requires gigabytes of memory and causes massive layout/paint recalculations. Virtual scrolling keeps DOM node count constant (O(1) memory and DOM footprint) regardless of whether the dataset contains 100 or 1,000,000 records.',
    spokenTip: 'Virtualization keeps the active DOM node count constant while simulating the full scroll height with absolute transforms or spacer paddings.',
    interviewAnswer: 'Standard DOM rendering scales linearly (O(N)): 100,000 `<tr>` elements cause browser tab crashes, massive memory footprints, and extreme scroll jank.\n\n**Virtual Scrolling Architecture**:\n1. Measure the container viewport height (e.g. 600px) and item height (e.g. 40px).\n2. Visible items = `Math.ceil(viewportHeight / itemHeight)` (~15 items).\n3. Add an overscan buffer (e.g., 5 items above and below) to prevent blank flashes during fast scrolling.\n4. Listen to container `scroll` events (throttled via `requestAnimationFrame`).\n5. Calculate `startIndex = Math.floor(scrollTop / itemHeight)` and `endIndex = startIndex + visibleCount + overscan`.\n6. Render only items between `startIndex` and `endIndex`, offsetting the visible container using `transform: translateY(startIndex * itemHeight)`. Total scrollbar height is simulated by an invisible inner container of `totalItems * itemHeight`.',
    keyPointsToMention: [
      'Constant DOM element count regardless of dataset size',
      'Virtual viewport math: scrollTop, itemHeight, startIndex, endIndex, and overscan',
      'Fixed item heights vs dynamic height measurement strategies',
      'CDK Virtual Scroll (Angular) / TanStack Virtual (React/Vue/Angular)'
    ],
    whatInterviewersLookFor: [
      'Understanding of overscan buffer to avoid blank white patches on fast scroll',
      'Knowledge of translateY vs margin/top positioning for GPU-accelerated compositing'
    ],
    codeExample: `// Angular CDK Virtual Scrolling Example
import { Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-large-dataset-table',
  standalone: true,
  imports: [ScrollingModule],
  template: \`
    <!-- Only ~20 DOM elements exist at any time, even with 100,000 records! -->
    <cdk-virtual-scroll-viewport itemSize="48" class="virtual-viewport">
      <div *cdkVirtualFor="let record of records; trackBy: trackById" class="table-row">
        <span>{{ record.id }}</span>
        <span>{{ record.name }}</span>
        <span>{{ record.balance | currency }}</span>
      </div>
    </cdk-virtual-scroll-viewport>
  \`,
  styles: [\`
    .virtual-viewport {
      height: 600px;
      width: 100%;
      overflow-y: auto;
      border: 1px solid #333;
    }
    .table-row {
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 16px;
    }
  \`]
})
export class LargeDatasetTableComponent {
  records = Array.from({ length: 100000 }, (_, i) => ({
    id: i + 1,
    name: \`User #\${i + 1}\`,
    balance: Math.random() * 10000
  }));

  trackById(index: number, item: any) {
    return item.id;
  }
}`,
    tags: ['performance', 'virtual-scrolling', 'windowing', 'cdk-scrolling', 'dom-optimization']
  },
  {
    id: 'perf_03',
    category: 'performance',
    topic: 'Bundle Optimization & Tree Shaking',
    difficulty: 'Senior',
    question: 'How does Tree Shaking work in modern bundlers (Vite/Webpack/esbuild), and what are "Barrel File Traps" and the `"sideEffects": false` flag?',
    shortAnswer: 'Tree shaking relies on ES Module static analysis (`import`/`export`) to eliminate dead/unused code. Barrel files (`index.ts` re-exporting 50 components) prevent effective tree shaking if files have side effects. Declaring `"sideEffects": false` in `package.json` guarantees to bundlers that imported modules contain no global side effects and can be safely dropped if their exported symbols are not used.',
    seniorPoint: 'Importing `import { Button } from "@/components"` from an unchecked barrel file will cause bundlers to parse and bundle all 50 components, charting libs, and icon packs re-exported in that `index.ts`. Direct path imports or bundler barrel-optimizations are essential.',
    spokenTip: 'Tree shaking requires pure ESM imports and explicit `sideEffects: false` metadata to prune dead code branches.',
    interviewAnswer: 'Tree shaking is dead-code elimination powered by the static structure of ES Modules.\n\n**Key Factors**:\n1. **CommonJS vs ESM**: CommonJS (`require()`) is dynamic and evaluated at runtime, making static dead-code pruning impossible. ESM (`import/export`) is statically analyzable at build time.\n2. **`"sideEffects": false`**: Tells the bundler that files in the package/project do not execute global mutations (like modifying prototypes or window globals). If an export is unused, the entire module file is dropped.\n3. **The Barrel File Problem**: An `index.ts` that re-exports 100 icons or components can pull in hundreds of kilobytes of unused dependencies. Solutions: Avoid massive barrel files, configure `optimizePackageImports` in Vite/Next.js/Angular, or use direct submodule imports (`import Button from "@/components/button"`).',
    keyPointsToMention: [
      'Static analysis requirements of ES Modules',
      'The role of sideEffects: false in package.json',
      'Barrel file bloat and remedies',
      'Analyzing bundles with webpack-bundle-analyzer or rollup-plugin-visualizer'
    ],
    whatInterviewersLookFor: [
      'Awareness of why barrel files inflate bundle sizes in large design systems',
      'Clear explanation of side effects in JS modules'
    ],
    codeExample: `// package.json in a shared UI library
{
  "name": "@my-org/ui-components",
  "version": "1.0.0",
  "type": "module",
  "sideEffects": [
    "**/*.css",          // CSS files DO have global side-effects (keep them!)
    "src/polyfills.ts"   // Polyfills have side effects
  ]
  // All other .ts files are marked pure -> safe for aggressive tree-shaking!
}

// ❌ Barrel file trap:
// import { Modal } from '@my-org/ui-components'; // Might pull in HeavyChart, Table, DatePicker!

// ✅ Direct path or configured subpath export:
// import { Modal } from '@my-org/ui-components/modal';`,
    tags: ['performance', 'bundle-optimization', 'tree-shaking', 'barrel-files', 'vite', 'esm']
  }
];
