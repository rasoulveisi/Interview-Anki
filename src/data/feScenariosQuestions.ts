import { Question } from '../types';

export const feScenariosQuestions: Question[] = [
  {
    id: 'fescen_01',
    category: 'fescenarios',
    topic: 'Stale Search Race Conditions & Debounce Triage',
    difficulty: 'Senior',
    question: 'Scenario: Users report intermittent bugs in the search bar where typing "angular" quickly shows results for "ang" instead of "angular". What is the root cause, and how do you fix it step-by-step?',
    shortAnswer: 'Root Cause: Network Race Condition. The HTTP request for "ang" took 800ms to resolve, while the subsequent request for "angular" resolved in 150ms. Because "ang" returned last, its callback overwrote the final state. Fix: 1) Debounce inputs by 300ms; 2) Filter distinct queries; 3) Use `switchMap` (or `AbortController`) to immediately abort in-flight requests when a new search term is entered.',
    seniorPoint: 'Fixing this only with `debounceTime()` reduces the probability of race conditions but does NOT eliminate them. Only cancellation (`switchMap` / `AbortSignal`) mathematically guarantees that slow stale responses cannot resolve into the UI state.',
    spokenTip: 'Debounce reduces API calls, but switchMap eliminates stale race conditions by cancelling in-flight requests.',
    interviewAnswer: 'Step-by-step Triage & Solution:\n1. **Diagnosis**: When a user types without cancellation, multiple HTTP requests fly in parallel. In asynchronous networking, response arrival order is non-deterministic. A slow backend query for "ang" (e.g. cold DB cache) can resolve AFTER a fast query for "angular", resulting in stale UI.\n2. **Immediate Remediation**:\n   - Convert the input event into a reactive stream (`formControl.valueChanges` or `fromEvent`).\n   - Apply `debounceTime(300)` to wait for typing pauses.\n   - Apply `distinctUntilChanged()` to avoid duplicate API calls if the user presses navigation keys.\n   - Pipe through `switchMap(term => this.http.get(...))` which automatically calls `unsubscribe()` on the previous in-flight HTTP observable, aborting the browser network request.\n   - Add `catchError` inside the `switchMap` inner observable so an error doesn\'t kill the outer search stream.',
    keyPointsToMention: [
      'Race conditions occur because network latency is non-deterministic',
      'Debounce alone is insufficient; cancellation is mandatory',
      'switchMap unsubscriptions automatically trigger browser XMLHttpRequest / fetch aborts',
      'Inner catchError placement to keep the main stream alive'
    ],
    whatInterviewersLookFor: [
      'Distinction between debouncing (rate limiting) vs cancellation (race condition mitigation)',
      'Understanding of catchError placement inside the inner observable'
    ],
    codeExample: `// Robust Search Pipeline
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  map(term => term.trim()),
  distinctUntilChanged(),
  switchMap(term => {
    if (!term) return of([]);
    return this.apiService.searchProducts(term).pipe(
      // CRITICAL: Handle errors inside switchMap to prevent killing outer stream!
      catchError(err => {
        console.error('Search failed:', err);
        return of([]);
      })
    );
  }),
  takeUntilDestroyed(this.destroyRef)
).subscribe(results => {
  this.searchResults.set(results);
});`,
    tags: ['fescenarios', 'race-conditions', 'switchMap', 'debounce', 'search-box', 'triage']
  },
  {
    id: 'fescen_02',
    category: 'fescenarios',
    topic: 'Diagnosing Production Memory Leaks',
    difficulty: 'Senior',
    question: 'Scenario: Users report that after using your enterprise SPA for 45 minutes, the browser tab consumes 2GB of RAM, stutters during interaction, and eventually crashes. How do you diagnose and resolve this memory leak using Chrome DevTools?',
    shortAnswer: 'Diagnosis: 1) Open Chrome DevTools -> **Memory Tab**; 2) Take a baseline **Heap Snapshot**; 3) Perform suspected user actions (open/close modal 10 times); 4) Take second Snapshot and use **Comparison View** filtered by detached DOM nodes (`Detached HTMLDivElement`) or retained component classes; 5) Inspect Retainer Tree to identify which closure, RxJS subscription, or global event listener is retaining the root reference. Resolution: Unsubscribe via `takeUntilDestroyed`, clean up event listeners, remove global singleton references.',
    seniorPoint: 'Look specifically for "Detached DOM trees" in the heap snapshot. When a component is destroyed by Angular/React, but a lingering closure holds a reference to a single child button, the browser is forced to keep the entire detached DOM subtree in RAM.',
    spokenTip: 'Use Chrome DevTools Heap Snapshots in Comparison Mode to trace detached DOM trees back to uncleaned subscriptions and global listeners.',
    interviewAnswer: 'Methodical Memory Leak Investigation:\n1. **Reproduce & Baseline**: Open Chrome in Incognito mode (to disable extensions). Navigate to the page, force a Garbage Collection (trash can icon in DevTools), and record Heap Snapshot #1.\n2. **Stress Action**: Perform the leaky action (e.g. opening and closing a report modal 10 times). Force Garbage Collection again, and take Heap Snapshot #2.\n3. **Comparison Analysis**:\n   - Set view to "Objects allocated between Snapshot 1 and 2".\n   - Search for `Detached` elements. If you see 10 detached `ReportModalComponent` or `HTMLDivElement` objects, the components are not being garbage collected.\n4. **Inspect Retainers**: Select a detached instance and look at the Retainers panel. Trace the path to the GC Root. Common culprits:\n   - Unsubscribed RxJS `interval()` or global singleton service subscriptions.\n   - `window.addEventListener(\\\'resize\\\')` without `removeEventListener` in `ngOnDestroy` / `useEffect`.\n   - Third-party chart/editor instances (e.g. Monaco / Chart.js) not destroyed via `.destroy()`.\n5. **Fix & Verify**: Apply automated teardown (`takeUntilDestroyed`, cleanup hooks), retake snapshots, and verify 0 detached elements remain.',
    keyPointsToMention: [
      'Heap Snapshot comparison mode in Chrome DevTools',
      'Identifying Detached DOM elements',
      'Inspecting Retainers to trace the GC Root reference',
      'Common leak sources: uncleaned listeners, intervals, RxJS subscriptions, 3rd party lib instances'
    ],
    whatInterviewersLookFor: [
      'Practical familiarity with Chrome DevTools Memory and Performance tabs',
      'Understanding of how Garbage Collectors trace reachability from GC Roots'
    ],
    codeExample: `// Common Leak Pattern & Fix:
export class DataChartComponent implements OnInit, OnDestroy {
  private chartInstance: any;
  private resizeListener = () => this.handleResize();

  ngOnInit() {
    this.chartInstance = new ThirdPartyChart(this.el.nativeElement);
    window.addEventListener('resize', this.resizeListener);
  }

  // ✅ CRITICAL TEARDOWN:
  ngOnDestroy() {
    // 1. Destroy third-party canvas/DOM instance
    this.chartInstance?.destroy();
    // 2. Remove window event listener
    window.removeEventListener('resize', this.resizeListener);
  }
}`,
    tags: ['fescenarios', 'memory-leaks', 'chrome-devtools', 'heap-snapshot', 'debugging', 'performance']
  }
];
