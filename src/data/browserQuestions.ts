import { Question } from '../types';

export const browserQuestions: Question[] = [
  {
    id: 'browser_01',
    category: 'browser',
    topic: 'Critical Rendering Path & Layout Thrashing',
    difficulty: 'Senior',
    question: 'How does the Browser Critical Rendering Path work? What causes Layout Thrashing and how do you achieve 60fps animations?',
    shortAnswer: 'The Critical Rendering Path converts HTML/CSS into pixels: HTML -> DOM, CSS -> CSSOM, DOM + CSSOM -> Render Tree, Layout (geometry), Paint (pixels), and Composite (layer blending on GPU). **Layout Thrashing** occurs when JavaScript reads geometry (`offsetWidth`) immediately after writing styles (`style.width`), forcing synchronous reflow loops. Use `transform` and `opacity` to animate exclusively on the GPU compositor thread without triggering layout or paint.',
    interviewAnswer: 'The browser rendering engine follows strict phases:\n1. **DOM & CSSOM Construction**: Parsing HTML tokens into the DOM and CSS rules into the CSSOM.\n2. **Render Tree**: Combining DOM and CSSOM to build the visible node hierarchy (ignoring `display: none` and `<head>`).\n3. **Layout (Reflow)**: Calculating exact pixel coordinates and geometry for every visible box.\n4. **Paint**: Filling in colors, borders, text, shadows, and images onto bitmap layers.\n5. **Composite**: GPU hardware blends separate layers together onto the screen.\n\n**Layout Thrashing (Forced Synchronous Layout)** happens inside loops when JavaScript repeatedly alternates between writing a DOM property (`element.style.left = ...`) and immediately reading a layout metric (`element.offsetLeft`). This forces the browser to synchronously recalculate layout on every iteration.\n\nFor smooth 60fps/120fps animations, animate only **Composite-only properties**: `transform` and `opacity`. These bypass Layout and Paint entirely, running directly on the GPU compositor thread.',
    spokenTip: 'Animate with transform and opacity on the GPU, and batch DOM reads before writes to avoid layout thrashing.',
    example: {
      language: 'javascript',
      code: `// ❌ BAD: Layout Thrashing (Forces layout recalculation on every loop iteration!)
function resizeBoxesBad(elements) {
  for (let i = 0; i < elements.length; i++) {
    const width = elements[i].offsetWidth; // READ (forces synchronous layout!)
    elements[i].style.width = (width + 10) + 'px'; // WRITE (invalidates layout!)
  }
}

// ✅ GOOD: Batched Reads before Writes (Only 1 layout calculation!)
function resizeBoxesGood(elements) {
  // Phase 1: Batch all DOM READS
  const widths = elements.map(el => el.offsetWidth);

  // Phase 2: Batch all DOM WRITES (using requestAnimationFrame)
  requestAnimationFrame(() => {
    elements.forEach((el, i) => {
      el.style.width = (widths[i] + 10) + 'px';
    });
  });
}

// ✅ BEST: 60fps GPU Compositor Animation (Bypasses Layout & Paint!)
// .box { transform: translateX(100px); will-change: transform; }`,
      explanation: 'Shows how batching DOM reads before writes eliminates forced synchronous layout thrashing.'
    },
    seniorPoint: '`will-change: transform` hints to the browser to promote the element to its own dedicated GPU composite layer in advance. However, overusing `will-change` on hundreds of elements exhausts GPU VRAM and harms performance.',
    followUps: [
      {
        question: 'Which DOM properties trigger forced synchronous layout when read in JavaScript?',
        answer: 'Any geometric query: `offsetWidth`, `offsetHeight`, `clientWidth`, `clientHeight`, `scrollTop`, `scrollLeft`, `getBoundingClientRect()`, and `getComputedStyle()`. '
      },
      {
        question: 'What is the difference between `display: none` and `visibility: hidden` in the rendering pipeline?',
        answer: '`display: none` removes the element from the Render Tree completely (skips layout & paint). `visibility: hidden` keeps the element in the Render Tree and calculates layout space, but skips painting pixels.'
      }
    ],
    keyPointsToMention: [
      'CRP pipeline: DOM -> CSSOM -> Render Tree -> Layout -> Paint -> Composite',
      'Layout Thrashing: interleaving DOM geometric reads with style writes inside loops',
      'Hardware acceleration: transform and opacity run directly on GPU compositor',
      'Batching reads before writes using FastDOM or requestAnimationFrame'
    ],
    tags: ['browser', 'critical-rendering-path', 'layout-thrashing', 'gpu', 'performance', 'reflow', 'repaint']
  },
  {
    id: 'browser_02',
    category: 'browser',
    topic: 'Workers & Multi-Threading',
    difficulty: 'Senior',
    question: 'How do Web Workers, Service Workers, and Worklets differ? How does data transfer work using Structured Clone vs Transferable Objects?',
    shortAnswer: 'Web Workers run CPU-heavy computations on background threads. Service Workers act as network proxy caches for offline PWAs. Worklets run low-level hooks in browser rendering pipelines (audio/paint). Data is passed to workers via `postMessage` using either **Structured Clone** (deep copy by value) or **Transferable Objects** (`ArrayBuffer`, transferring zero-copy memory ownership).',
    interviewAnswer: 'The browser provides specialized worker threads to keep the main UI thread responsive:\n1. **Web Workers (Dedicated / Shared)**: True background threads with their own event loop and memory context (no DOM access). Use them for heavy computation: image manipulation, cryptographic hashing, parsing 50MB CSV files, or pathfinding algorithms.\n2. **Service Workers**: Event-driven network proxies that sit between the browser and network. They intercept HTTP requests (`fetch` event), manage CacheStorage for offline PWA functionality, and handle Background Sync and Web Push Notifications.\n3. **Worklets (Paint / Audio / Animation Worklets)**: Ultra-lightweight hooks that run directly inside the browser\'s rendering or audio engine at 60fps.\n\n**Data Transfer Mechanisms**:\n- **Structured Clone (Default)**: Deep-copies data between threads. Copying a 100MB object duplicates memory and causes serialization delays.\n- **Transferable Objects (`ArrayBuffer`, `ImageBitmap`, `MessagePort`)**: Transfers *memory ownership* instantly ($O(1)$ zero-copy). Once transferred, the buffer becomes detached (0-byte length) on the sender thread, guaranteeing thread safety without race conditions.',
    spokenTip: 'Web Workers offload heavy CPU math; Service Workers intercept network requests for offline caching; Transferable Objects transfer ArrayBuffer ownership with zero copy.',
    example: {
      language: 'javascript',
      code: `// Main Thread: Zero-Copy Data Transfer via Transferable Objects
const worker = new Worker('heavy-calculator.worker.js');

// Allocate 50MB binary buffer
const buffer = new ArrayBuffer(50 * 1024 * 1024);
const floatView = new Float64Array(buffer);
floatView[0] = 42.5;

console.log('Main thread buffer byteLength before transfer:', buffer.byteLength); // 52428800

// Pass buffer as both payload AND in the transfer array [buffer]
worker.postMessage({ data: buffer }, [buffer]);

// Instantly transferred! Buffer is now detached on main thread (0 bytes!)
console.log('Main thread buffer byteLength after transfer:', buffer.byteLength); // 0!

worker.onmessage = (e) => {
  console.log('Calculated result received from worker:', e.data);
};`,
      explanation: 'Demonstrates zero-copy ArrayBuffer memory transfer via Transferable Objects.'
    },
    seniorPoint: 'Web Workers do not have access to the `window` or `document` DOM. If a Web Worker needs to render graphics, transfer an `HTMLCanvasElement` using `canvas.transferControlToOffscreen()` to let the worker render via WebGL on the background thread.',
    followUps: [
      {
        question: 'Why can\'t you access `localStorage` inside a Web Worker or Service Worker?',
        answer: '`localStorage` is synchronous and blocks the thread. Workers strictly disallow synchronous blocking APIs to maintain background performance; use asynchronous `IndexedDB` instead.'
      },
      {
        question: 'What is the lifecycle of a Service Worker?',
        answer: '`Parsed` -> `Installing` -> `Installed (Waiting)` -> `Activating` -> `Activated (Running)`. It updates in the background and activates when old tabs are closed.'
      }
    ],
    keyPointsToMention: [
      'Web Workers (CPU offload) vs Service Workers (network proxy/PWA) vs Worklets (render engine hooks)',
      'No direct DOM access in workers',
      'Structured Clone (data copy) vs Transferable Objects (zero-copy memory transfer)',
      'OffscreenCanvas for background thread chart and WebGL rendering'
    ],
    tags: ['browser', 'web-workers', 'service-workers', 'multi-threading', 'arraybuffer', 'pwa']
  },
  {
    id: 'browser_03',
    category: 'browser',
    topic: 'Browser Storage Architecture',
    difficulty: 'Senior',
    question: 'Compare localStorage, sessionStorage, IndexedDB, and Cookies for enterprise client storage. What are the security and performance trade-offs?',
    shortAnswer: '`localStorage` and `sessionStorage` are synchronous, string-only, and block the main thread (~5MB limit). `IndexedDB` is asynchronous, transactional, indexed, and stores gigabytes of structured objects/blobs without blocking. `Cookies` (~4KB) are automatically sent on HTTP headers and support `HttpOnly; Secure; SameSite` protection.',
    interviewAnswer: 'Enterprise client storage options across key dimensions:\n- **`localStorage` (~5MB)**: Synchronous key-value string store persistent across sessions. Because read/write operations are synchronous, querying large JSON payloads blocks the main UI thread. Vulnerable to XSS.\n- **`sessionStorage` (~5MB)**: Synchronous, isolated per browser tab. Data is cleared when the tab is closed.\n- **`IndexedDB` (Gigabytes / 60%+ of disk space)**: Asynchronous, transactional object-oriented NoSQL database. It supports binary Blobs, ArrayBuffers, secondary indexes, and cursor range queries. Does not block the main thread, making it ideal for offline caching, PWA datasets, and drafts.\n- **`Cookies` (~4KB)**: Designed for server-client state management. The browser sends matching cookies automatically on every HTTP request header. With `HttpOnly`, `Secure`, and `SameSite=Strict`, cookies cannot be stolen via JavaScript XSS attacks, making them the safest place for session tokens.',
    spokenTip: 'Use HttpOnly cookies for session auth, IndexedDB for large offline data and blobs, and sessionStorage for tab-scoped state.',
    example: {
      language: 'javascript',
      code: `// Async IndexedDB Transaction (Non-blocking, structured data)
function saveOfflineDraft(draft) {
  const request = indexedDB.open('AppDatabase', 1);

  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('drafts')) {
      const store = db.createObjectStore('drafts', { keyPath: 'id' });
      store.createIndex('by_date', 'updatedAt');
    }
  };

  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction('drafts', 'readwrite');
    const store = tx.objectStore('drafts');
    store.put(draft); // Non-blocking write!
  };
}`,
      explanation: 'Shows setup of IndexedDB object store with indexes and asynchronous non-blocking writes.'
    },
    seniorPoint: 'A common frontend bug is using `localStorage.getItem()` inside high-frequency scroll or render loops. On mobile devices with slow flash storage, reading from `localStorage` can freeze the main thread for 20ms-50ms, causing dropped animation frames.',
    followUps: [
      {
        question: 'What is Storage Persistence in modern browsers?',
        answer: 'Browsers may evict IndexedDB under low disk pressure unless the app calls `navigator.storage.persist()`, which marks the storage as durable and exempt from automatic eviction.'
      },
      {
        question: 'Why should you never store sensitive access tokens in `localStorage`?',
        answer: 'Any malicious script injected via an XSS vulnerability (e.g. compromised npm package or unsanitized user input) can read `localStorage` via JavaScript and exfiltrate user tokens.'
      }
    ],
    keyPointsToMention: [
      'localStorage/sessionStorage: synchronous, string-only, blocks main thread, 5MB limit',
      'IndexedDB: asynchronous, transactional, indexed NoSQL, gigabytes capacity, non-blocking',
      'Cookies: 4KB, sent automatically on HTTP headers, HttpOnly/Secure/SameSite flags',
      'XSS vulnerability of client-side storage vs CSRF risks of cookies'
    ],
    tags: ['browser', 'storage', 'indexeddb', 'localstorage', 'cookies', 'security', 'performance']
  },
  {
    id: 'browser_04',
    category: 'browser',
    topic: 'CORS, Preflight OPTIONS, and Credentials',
    difficulty: 'Senior',
    question: 'How does Cross-Origin Resource Sharing (CORS) work? What triggers a Preflight OPTIONS request, and why do requests with Authorization headers or custom headers trigger preflights?',
    shortAnswer: 'CORS is a browser security mechanism enforced by the Same-Origin Policy. A **Preflight `OPTIONS` request** is triggered whenever a request is "not simple" (e.g. methods other than GET/POST/HEAD, `Content-Type: application/json`, or custom headers like `Authorization`). The server must respond with `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers` before the browser sends the actual request.',
    interviewAnswer: 'The browser\'s Same-Origin Policy (SOP) blocks frontend JavaScript on `app.domain.com` from reading responses from `api.domain.com` unless the server explicitly opts in via CORS headers.\n\n1. **Simple Requests**: Bypass preflights. Only allowed for `GET`, `HEAD`, `POST` with standard content-types (`text/plain`, `multipart/form-data`, `application/x-www-form-urlencoded`) and no custom headers.\n2. **Preflight `OPTIONS`**: Triggered when sending JSON (`Content-Type: application/json`), `PUT/PATCH/DELETE`, or custom headers like `Authorization: Bearer <token>` or `X-API-Key`. The browser automatically fires an HTTP `OPTIONS` request with `Origin` and `Access-Control-Request-Headers`.\n3. **Credentials (`withCredentials` / cookies)**: If sending HttpOnly cookies cross-origin, `Access-Control-Allow-Credentials: true` is mandatory, AND `Access-Control-Allow-Origin` cannot be wildcard `*` (must echo the exact origin).',
    spokenTip: 'CORS is a browser-enforced security check. JSON payloads and Authorization headers always trigger an OPTIONS preflight that the backend must allow.',
    example: {
      language: 'javascript',
      code: `// Express.js / Cloudflare CORS Middleware Configuration
const allowedOrigins = ['https://app.example.com', 'https://staging.example.com'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight response for 24h!

  // Intercept preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});`,
      explanation: 'Shows strict origin matching, credentials support, and 24h preflight caching with Access-Control-Max-Age.'
    },
    seniorPoint: 'To reduce latency caused by double round-trips for every API request, configure `Access-Control-Max-Age: 86400`. This caches the preflight OPTIONS response in the browser, eliminating preflights for subsequent requests to the same endpoint.',
    followUps: [
      {
        question: 'Does CORS protect backend databases from being modified by attackers?',
        answer: 'No. CORS is purely a browser-side check. An attacker can easily send cURL, Postman, or script requests directly to the API without a browser, bypassing CORS entirely. Backends must protect endpoints with authentication tokens and CSRF guards.'
      },
      {
        question: 'Why does `Access-Control-Allow-Origin: *` fail when `credentials: "include"` is set on `fetch`?',
        answer: 'Browser security specs forbid wildcard `*` when credentials (cookies/auth headers) are sent, to prevent malicious sites from reading authenticated private user data.'
      }
    ],
    keyPointsToMention: [
      'Same-Origin Policy (Scheme + Host + Port match)',
      'Preflight triggers: non-simple methods (PUT/DELETE), JSON content-type, Authorization headers',
      'Access-Control-Max-Age to cache preflight responses and reduce network latency',
      'Credentials require explicit origin echoing, never wildcard *'
    ],
    tags: ['browser', 'cors', 'security', 'preflight', 'options-request', 'headers', 'http']
  },
  {
    id: 'browser_05',
    category: 'browser',
    topic: 'Service Workers & Offline Caching Strategies',
    difficulty: 'Senior',
    question: 'How do Service Workers operate, and how do you implement Stale-While-Revalidate vs Cache-First vs Network-First caching strategies?',
    shortAnswer: 'A Service Worker is an event-driven background worker running on a separate thread acting as a programmable network proxy. **Cache-First** serves from cache and falls back to network (for static immutable assets). **Network-First** fetches from network with cache fallback (for dynamic real-time data). **Stale-While-Revalidate** returns cached data instantly while fetching a fresh copy in the background.',
    interviewAnswer: 'A Service Worker intercepts network requests via the `fetch` event listener and manages the browser\'s `CacheStorage` API:\n\n1. **Stale-While-Revalidate**: The gold standard for fast web applications. It serves the cached version immediately to achieve instant paint times, while simultaneously firing a background network request. When the fresh response arrives, it updates the cache for the next view.\n2. **Cache-First**: Checks CacheStorage first. If found, returns it immediately without hitting the network. Ideal for hashed, immutable production bundles (`bundle-a8f3.js`, web fonts, optimized hero images).\n3. **Network-First**: Attempts to fetch over the network first. If offline or the network times out (e.g. 3s timeout), returns the cached fallback. Ideal for user profiles, live dashboard metrics, and document editors.',
    spokenTip: 'I use Cache-First for version-hashed assets, Network-First for real-time APIs, and Stale-While-Revalidate for fast UI state.',
    example: {
      language: 'javascript',
      code: `// Service Worker: Stale-While-Revalidate Strategy
const CACHE_NAME = 'v1-data-cache';

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/articles')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // 1. Fetch fresh data in background
          const networkFetch = fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });

          // 2. Return cached data immediately if present, else wait for network
          return cachedResponse || networkFetch;
        });
      })
    );
  }
});`,
      explanation: 'Implements Stale-While-Revalidate caching pattern for instant load speeds with background freshness.'
    },
    seniorPoint: 'Service Workers do not have access to the DOM or `window` object and communicate with client pages via `postMessage` or `BroadcastChannel`. Updating a Service Worker requires handling the `waiting` lifecycle state (`skipWaiting()` and `clients.claim()`) to avoid serving stale assets across tabs.',
    followUps: [
      {
        question: 'What is the Service Worker lifecycle sequence?',
        answer: 'Register -> Install (`install` event, cache static assets) -> Activate (`activate` event, delete old cache versions) -> Idle / Fetch.'
      },
      {
        question: 'Why must Service Workers only run on HTTPS (except localhost)?',
        answer: 'Because a Service Worker has full power to intercept, modify, and hijack every HTTP network request and response, requiring strict cryptographic transport security.'
      }
    ],
    keyPointsToMention: [
      'Service Worker lifecycle: install, activate, fetch',
      'Stale-While-Revalidate vs Cache-First vs Network-First',
      'CacheStorage API for programmatic offline asset management',
      'Background communication via BroadcastChannel / postMessage'
    ],
    tags: ['browser', 'service-worker', 'pwa', 'offline', 'caching', 'stale-while-revalidate']
  }
];
