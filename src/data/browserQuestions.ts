import { Question } from '../types';

export const browserQuestions: Question[] = [
  {
    id: 'browser_01',
    category: 'browser',
    topic: 'Critical Rendering Path & Layout Thrashing',
    difficulty: 'Senior',
    question: 'Describe the Critical Rendering Path. What causes Reflow (Layout) vs Repaint, and how do you prevent Layout Thrashing (Forced Synchronous Layout)?',
    shortAnswer: 'The Critical Rendering Path: HTML -> DOM tree, CSS -> CSSOM tree, combined into Render Tree -> Layout (computes geometry/coordinates) -> Paint (rasterizes pixels) -> Compositing (GPU layers). Reflow recalculates layout geometry (expensive); Repaint redraws colors/visibility without altering geometry. Layout Thrashing happens when JS alternates between reading computed styles (`offsetWidth`, `scrollTop`) and writing DOM styles in a tight loop.',
    seniorPoint: 'Reading a layout property (like `element.offsetHeight`) right after a DOM write forces the browser to synchronously flush pending layout calculations before the JavaScript turn ends. Batching all reads first, then all writes (or using `requestAnimationFrame`) avoids forced synchronous layouts.',
    spokenTip: 'Separate DOM reads from DOM writes to avoid forcing the browser engine into repetitive, synchronous reflow cycles.',
    interviewAnswer: 'The browser rendering pipeline:\n1. **DOM & CSSOM Construction**: Streams HTML/CSS tokens into tree nodes.\n2. **Render Tree**: Filters out `display: none` and matches visible nodes with CSS rules.\n3. **Layout (Reflow)**: Computes exact pixel coordinates and bounding boxes for every visible element.\n4. **Paint**: Draws text, backgrounds, shadows into bitmap layers.\n5. **Composite**: Sends separate raster layers to the GPU for final hardware composition.\n\n**Layout Thrashing**: If you modify the DOM and immediately query a geometric property (e.g. `const h = el.offsetHeight`), the browser must execute an immediate forced reflow. In a loop of 100 elements, this turns 1 layout into 100 blocking layouts. Always read all layout metrics first in batch, then perform write mutations, or use `transform` and `opacity` (which bypass layout and paint completely on the GPU).',
    keyPointsToMention: [
      'DOM + CSSOM -> Render Tree -> Layout -> Paint -> Composite',
      'Reflow (geometry changes: width, height, margin, fontSize) triggers Repaint',
      'Repaint (color, visibility, background) does not trigger Reflow',
      'GPU-accelerated properties: transform and opacity bypass Reflow and Paint',
      'Layout Thrashing: interleaved DOM reads and writes forcing synchronous layouts'
    ],
    whatInterviewersLookFor: [
      'Clear list of geometric read properties that force reflow (offsetWidth, clientHeight, getBoundingClientRect, scrollTop)',
      'Understanding of GPU layer promotion via will-change: transform'
    ],
    codeExample: `// ❌ BAD: Layout Thrashing (Forces layout on EVERY iteration)
const boxes = document.querySelectorAll('.box');
boxes.forEach(box => {
  const currentHeight = box.offsetHeight; // FORCED READ (forces reflow!)
  box.style.height = (currentHeight + 10) + 'px'; // WRITE
});

// ✅ GOOD: Batched Reads and Writes
const heights: number[] = [];
// Phase 1: All Reads (Browser computes layout once)
boxes.forEach(box => heights.push(box.offsetHeight));

// Phase 2: All Writes (Scheduled in one batch)
boxes.forEach((box, i) => {
  box.style.height = (heights[i] + 10) + 'px';
});

// ✅ BEST: GPU Accelerated CSS Animation
// element.style.transform = 'translateY(10px) scale(1.1)'; // Zero Reflow & Zero Paint!`,
    tags: ['browser', 'critical-rendering-path', 'reflow', 'repaint', 'layout-thrashing', 'gpu']
  },
  {
    id: 'browser_02',
    category: 'browser',
    topic: 'Web Workers vs Service Workers',
    difficulty: 'Senior',
    question: 'Contrast Web Workers, Service Workers, and Worklets. How do you offload heavy CPU work without freezing the 60fps UI thread?',
    shortAnswer: 'Web Workers run JS scripts in a separate background thread with no DOM access, communicating via `postMessage` or `SharedArrayBuffer` for CPU-intensive data crunching. Service Workers act as programmable network proxy servers running in the background for offline caching, background sync, and push notifications. Worklets are low-level hooks into browser rendering (Audio, Paint, Animation).',
    seniorPoint: 'Passing large payloads via standard `postMessage(data)` clones data via `structuredClone()`, which can cause short main-thread freezes. Use **Transferable Objects** (e.g. `worker.postMessage(arrayBuffer, [arrayBuffer])`) to transfer zero-copy memory ownership instantaneously.',
    spokenTip: 'Web Workers are for heavy computation; Service Workers are for network proxying and offline capabilities.',
    interviewAnswer: '1. **Web Workers (Dedicated Workers)**: A dedicated OS thread spawned by `new Worker("worker.js")`. Runs heavy algorithms (e.g. parsing 50MB JSON files, Excel export, client-side encryption, image processing) in the background without blocking the UI main thread. Cannot access `window` or the DOM.\n2. **Service Workers**: Event-driven network proxies installed at the browser/origin level. Intercepts fetch requests (`fetch` event), manages Cache Storage (`cache.put()`) for offline-first PWAs, and listens for background push notifications even when no tab is open.\n3. **Worklets**: High-performance, lightweight rendering scripts that run directly inside the browser\'s rendering engine pipeline (e.g., CSS Paint Worklet, AudioWorklet).',
    keyPointsToMention: [
      'Web Workers: background computational thread, communication via postMessage',
      'Transferable objects for zero-copy memory transfer',
      'Service Workers: network proxy, lifecycle (install, activate, fetch), offline caching',
      'Main thread 60fps frame budget (16.6ms per frame)'
    ],
    whatInterviewersLookFor: [
      'Understanding of the single-threaded UI limitation and frame budget',
      'Knowledge of Transferable Objects vs structured cloning serialization'
    ],
    codeExample: `// --- Main Thread (Angular / React) ---
const worker = new Worker(new URL('./data-cruncher.worker', import.meta.url));

// 1. Create a large typed array buffer (e.g. 20MB)
const buffer = new ArrayBuffer(20 * 1024 * 1024);

// 2. Transfer ownership with ZERO memory copy overhead
worker.postMessage({ buffer }, [buffer]);
console.log(buffer.byteLength); // 0 (detached/transferred to worker!)

worker.onmessage = (e) => {
  console.log('Calculation complete:', e.data.result);
};

// --- Inside data-cruncher.worker.ts ---
addEventListener('message', ({ data }) => {
  const view = new Float64Array(data.buffer);
  // Perform heavy CPU calculations without dropping UI frames...
  let sum = 0;
  for (let i = 0; i < view.length; i++) sum += view[i];
  postMessage({ result: sum });
});`,
    tags: ['browser', 'web-workers', 'service-workers', 'multi-threading', 'performance', 'pwa']
  },
  {
    id: 'browser_03',
    category: 'browser',
    topic: 'Browser Storage Mechanisms',
    difficulty: 'Senior',
    question: 'Compare `localStorage`, `sessionStorage`, `IndexedDB`, `Cookies`, and the `Cache API`. What are their storage limits, security characteristics, and synchronous vs asynchronous I/O behavior?',
    shortAnswer: '`localStorage` and `sessionStorage` are synchronous, blocking key-value stores limited to ~5MB (vulnerable to XSS). `Cookies` (~4KB) are transmitted with every HTTP request (secure with `HttpOnly` and `SameSite`). `IndexedDB` is an asynchronous, transactional, indexed NoSQL database supporting hundreds of megabytes/gigabytes. `Cache API` stores request/response pairs for offline network caching.',
    seniorPoint: 'Because `localStorage` is synchronous, reading or writing large strings on the main thread blocks UI interaction. For enterprise apps handling large datasets offline, always use IndexedDB (wrapped with `idb` or `Dexie.js`).',
    spokenTip: 'Use `HttpOnly` cookies for auth tokens, IndexedDB for large client data, and Cache Storage for offline static assets.',
    interviewAnswer: '1. **Cookies**: ~4KB. Automatically attached in HTTP request headers. Essential for auth session cookies using `HttpOnly` (blocks JS access, protecting against XSS) and `SameSite=Strict/Lax` (protects against CSRF).\n2. **localStorage**: ~5MB per origin. Synchronous string key-value store. Persists until explicitly cleared. Blocking I/O on main thread.\n3. **sessionStorage**: ~5MB. Scoped to a single browser tab session; destroyed when tab is closed.\n4. **IndexedDB**: Asynchronous, transactional object store. Handles gigabytes of structured data, indexes, blobs, and typed arrays without blocking the main UI thread.\n5. **Cache API**: Asynchronous storage of Request/Response pairs utilized by Service Workers for offline asset serving.',
    keyPointsToMention: [
      'Synchronous blocking nature of localStorage/sessionStorage vs asynchronous IndexedDB',
      'Cookie security flags: HttpOnly, Secure, SameSite=Strict/Lax',
      'IndexedDB capacity and transaction model for offline-first enterprise applications'
    ],
    whatInterviewersLookFor: [
      'Understanding of security trade-offs (never put refresh tokens in localStorage)',
      'Performance awareness of main-thread synchronous storage vs IndexedDB'
    ],
    codeExample: `// IndexedDB with Modern Async/Await (using idb library)
import { openDB } from 'idb';

async function initOfflineDatabase() {
  const db = await openDB('EnterpriseAppDB', 1, {
    upgrade(db) {
      const store = db.createObjectStore('offlineCards', { keyPath: 'id' });
      store.createIndex('byDeck', 'deckId');
      store.createIndex('byDue', 'due');
    }
  });

  // Async Transaction without blocking UI thread
  await db.put('offlineCards', {
    id: 'card_101',
    deckId: 'deck_angular',
    front: 'What is a Signal?',
    due: Date.now()
  });

  const cardsInDeck = await db.getAllFromIndex('offlineCards', 'byDeck', 'deck_angular');
  return cardsInDeck;
}`,
    tags: ['browser', 'storage', 'indexeddb', 'localstorage', 'cookies', 'cache-api']
  }
];
