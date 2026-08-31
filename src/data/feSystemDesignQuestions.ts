import { Question } from '../types';

export const feSystemDesignQuestions: Question[] = [
  {
    id: 'fesys_01',
    category: 'fesystemdesign',
    topic: 'Real-Time High-Frequency Telemetry Dashboard',
    difficulty: 'Senior',
    question: 'Frontend System Design: Design a high-frequency real-time stock/crypto or IoT telemetry dashboard receiving 500+ updates per second without freezing the UI.',
    shortAnswer: 'Key Architecture: 1) WebSocket client with auto-reconnection & heartbeat; 2) In-Memory Ring Buffer / Web Worker to buffer incoming ticks and crunch indicators; 3) Throttled RAF Dispatcher: batch UI updates to 60fps (16.6ms intervals) using `requestAnimationFrame`; 4) Localized Change Detection (OnPush / Signals) or Canvas/WebGL for charting.',
    interviewAnswer: 'System Design Walkthrough:\n1. **Network Layer**: WebSocket connection with binary protocols (Protocol Buffers or MessagePack) to reduce payload size. Reconnection backoff with jitter.\n2. **Buffer & Ingestion Layer**: Store streaming ticks in a typed circular ring buffer. Calculate moving averages, order book depth, and RSI indicators inside a dedicated **Web Worker** to keep the UI main thread free.\n3. **Render Throttling (60Hz Sync)**: Flush updates from the buffer to the UI at 60fps using a `requestAnimationFrame` loop or RxJS `bufferTime(16)`. Do not trigger re-renders on every individual tick.\n4. **Rendering Strategy**:\n   - Grid/Tables: Use Virtual Scrolling and fine-grained Signals so only the changed cell value updates, bypassing full table re-renders.\n   - Live Charts: Use HTML5 Canvas or WebGL (PixiJS / Lightweight Charts) instead of SVG or DOM elements.\n5. **Resilience**: Backpressure detection—if the main thread frame rate drops below 30fps, dynamically increase the buffer window and downsample tick frequencies.',
    spokenTip: 'Decouple network ingestion from screen refresh: buffer streaming messages in a worker or ring buffer and flush to the DOM at 60fps via requestAnimationFrame.',
    example: {
      language: 'typescript',
      code: `// Decouple Ingestion from 60fps Rendering Loop
interface StockTick {
  symbol: string;
  price: number;
  timestamp: number;
}

export class TelemetryStreamManager {
  private buffer: Map<string, StockTick> = new Map();
  private rafId: number | null = null;
  private onFlushCallback: (batch: StockTick[]) => void;

  constructor(onFlush: (batch: StockTick[]) => void) {
    this.onFlushCallback = onFlush;
  }

  // 1. Ingest 500+ ticks per second from WebSocket
  ingestTick(tick: StockTick) {
    // Store latest price in map (collapses duplicates within the frame)
    this.buffer.set(tick.symbol, tick);

    if (!this.rafId) {
      // 2. Schedule single render flush on the next animation frame (16.6ms)
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  private flush() {
    const batch = Array.from(this.buffer.values());
    this.buffer.clear();
    this.rafId = null;
    // 3. Dispatch batch to Fine-Grained Signal or Canvas chart
    this.onFlushCallback(batch);
  }
}`,
      explanation: 'Decouples 500Hz network stream ingestion from 60fps UI rendering using requestAnimationFrame batching.'
    },
    seniorPoint: 'If you push 500 updates/sec directly into the React/Angular change detection tree, the main thread will lock up completely. You must decouple network ingestion rate (500Hz) from screen rendering refresh rate (60Hz) using a buffer and `requestAnimationFrame`.',
    followUps: [
      {
        question: 'Why should you choose HTML5 Canvas over SVG for high-frequency charts?',
        answer: 'SVG creates thousands of individual DOM elements that browser engines must layout, repaint, and manage in memory. Canvas is an immediate-mode bitmap rasterized directly on the GPU without DOM tree overhead.'
      },
      {
        question: 'How do you handle client backpressure when the browser cannot keep up with network throughput?',
        answer: 'Drop intermediate price ticks and retain only the latest price per symbol per animation frame (lossy collapsing), or notify the backend via WebSocket to downsample the stream frequency.'
      }
    ],
    systemDesignDetails: {
      architectureOverview: 'WebSocket Ingestion -> Web Worker (Calculation & Normalization) -> Circular Ring Buffer -> 60fps RAF Dispatcher -> Canvas / Fine-Grained Signals View',
      cachingAndPerformance: 'ArrayBuffers, RequestAnimationFrame batching, Web Worker offloading, Canvas/WebGL chart rendering',
      failureScenariosAndMitigations: [
        'WebSocket drops: Handled via exponential backoff reconnect and REST snapshot catch-up query.',
        'Main thread frame drop: Buffer dynamically drops intermediate sub-frame ticks.'
      ]
    },
    keyPointsToMention: [
      'Decoupling ingestion frequency (500Hz) from display refresh rate (60Hz)',
      'requestAnimationFrame / bufferTime(16) throttling',
      'Web Workers for indicator crunching and calculations',
      'Canvas / WebGL for charts over DOM/SVG',
      'Binary serialization (Protobuf / MessagePack)'
    ],
    tags: ['fesystemdesign', 'system-design', 'websockets', 'telemetry', 'high-frequency', 'raf', 'web-workers']
  },
  {
    id: 'fesys_02',
    category: 'fesystemdesign',
    topic: 'Instant Search & Autocomplete System',
    difficulty: 'Senior',
    question: 'Frontend System Design: Design an enterprise-grade Autocomplete & Search system with keyboard navigation, caching, race condition prevention, and offline capability.',
    shortAnswer: 'Key Architecture: 1) Input pipeline with `debounceTime(250)` and `distinctUntilChanged()`; 2) `switchMap` to cancel stale in-flight requests; 3) Multi-tier cache (In-Memory LRU Cache + IndexedDB fallback); 4) Complete WAI-ARIA Combobox accessibility (`role="combobox"`, `aria-autocomplete="list"`, `aria-activedescendant`); 5) Full keyboard navigation (Arrow Up/Down, Enter, Escape).',
    interviewAnswer: 'System Architecture Breakdown:\n1. **Input Pipeline**: Listen to `input` event -> filter empty query -> `debounceTime(250)` -> `distinctUntilChanged()`.\n2. **Cancellation & Race Conditions**: Pipe through `switchMap()` or `AbortController`. When user types a new character, abort previous HTTP network socket immediately.\n3. **Caching Strategy**: Implement an in-memory **LRU Cache** (e.g. max 100 queries) to return instant results for previously typed queries without hitting the network. Stale-While-Revalidate pattern.\n4. **Accessibility (WAI-ARIA Combobox Pattern)**:\n   - Container: `role="combobox"`, `aria-expanded="true/false"`, `aria-controls="results-listbox"`\n   - Results list: `role="listbox"`, items `role="option"`\n   - Manage active item with `aria-activedescendant="option-id"` as the user presses ArrowUp / ArrowDown without losing focus from the input box.\n5. **Keyboard Support**: Down/Up navigates suggestions, Enter selects, Escape closes suggestions and clears.',
    spokenTip: 'Debounce input, switchMap to cancel stale queries, cache via LRU, and follow the W3C Combobox ARIA pattern.',
    example: {
      language: 'typescript',
      code: `// Complete Reactive Search Service Pipeline with LRU Cache
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs';

export interface SearchResult {
  id: string;
  title: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class AutocompleteSearchService {
  private http = inject(HttpClient);
  private lruCache = new Map<string, SearchResult[]>(); // Simple LRU Cache
  private readonly MAX_CACHE = 100;

  search(query$: Observable<string>): Observable<SearchResult[]> {
    return query$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((term) => {
        const cleanTerm = term.trim().toLowerCase();
        if (!cleanTerm) return of([]);

        // 1. Check LRU Cache for instant sub-millisecond response
        if (this.lruCache.has(cleanTerm)) {
          return of(this.lruCache.get(cleanTerm)!);
        }

        // 2. Fetch from API with automatic cancellation of in-flight queries
        return this.http.get<SearchResult[]>(\`/api/search?q=\${encodeURIComponent(cleanTerm)}\`).pipe(
          tap((results) => {
            if (this.lruCache.size >= this.MAX_CACHE) {
              const oldestKey = this.lruCache.keys().next().value;
              if (oldestKey) this.lruCache.delete(oldestKey);
            }
            this.lruCache.set(cleanTerm, results);
          }),
          catchError(() => of([]))
        );
      })
    );
  }
}`,
      explanation: 'Reactive Autocomplete search service with LRU in-memory caching and switchMap cancellation.'
    },
    seniorPoint: 'Stale race conditions occur when query "abc" returns slower than query "abcd". `switchMap` (or `AbortController` in fetch) cancels the in-flight HTTP request for "abc", ensuring older slower network responses can never overwrite newer search results.',
    followUps: [
      {
        question: 'Why should you manage focus with `aria-activedescendant` rather than focusing the `<li>` elements directly?',
        answer: 'Using `aria-activedescendant` keeps keyboard focus inside the `<input>` element so the user can continue typing or editing without losing cursor position, while still announcing the active dropdown item to screen readers.'
      },
      {
        question: 'How do you highlight the matching substring in autocomplete results safely?',
        answer: 'Split the text into matching and non-matching tokens using regex and render them with `<mark>` or `<strong>` tags, escaping HTML to prevent XSS injection.'
      }
    ],
    systemDesignDetails: {
      architectureOverview: 'Search Input -> Debounce -> LRU Cache Check -> switchMap(AbortController HTTP) -> Result Normalizer -> WAI-ARIA Combobox UI',
      cachingAndPerformance: 'LRU Cache (100 items), Highlight query matching via regex, Virtualized dropdown for 100+ items',
      authAndSecurity: 'Sanitize query string, encode URI components to prevent query injection'
    },
    keyPointsToMention: [
      'Race condition prevention via switchMap or AbortSignal',
      'LRU caching for instant re-queries',
      'WAI-ARIA Combobox 1.2 specifications and aria-activedescendant focus pattern',
      'Highlighting matching text tokens in results'
    ],
    tags: ['fesystemdesign', 'system-design', 'search', 'autocomplete', 'debounce', 'switchMap', 'a11y', 'lru-cache']
  }
];
