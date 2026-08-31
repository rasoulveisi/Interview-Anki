import { Question } from '../types';

export const systemDesignQuestions: Question[] = [
  {
    id: 'sys-design-ecommerce-system',
    category: 'systemdesign',
    topic: 'High-Scale E-Commerce Platform',
    difficulty: 'Strong Mid',
    question: 'System Design: How would you design a scalable E-Commerce System (Product Catalog, Cart, Checkout)?',
    shortAnswer: 'I would design a decoupled system with an Angular SPA/SSR on Cloudflare CDN, ASP.NET Core API Gateway, dedicated services for Catalog (Read-heavy, Redis/Elasticsearch cache), Cart (Redis key-value store), and Order/Payment (ACID SQL with transactional Outbox and Sagas).',
    interviewAnswer: 'When designing an e-commerce platform, I split the system based on traffic patterns: The **Product Catalog** is 95% reads, so we use CDN edge caching and Redis/Elasticsearch for fast search, faceting, and product views. The **Shopping Cart** requires fast, transient read/writes, which we store in Redis keyed by `cart:{userId}` or a session token with a 14-day TTL. The **Checkout & Order Service** is write-intensive and requires strict data consistency. We use SQL database (PostgreSQL/SQL Server) for order tables with optimistic concurrency and inventory locks. During checkout, we generate an Idempotency Key, reserve inventory, process payment with Stripe, and publish an `OrderPlacedEvent` to RabbitMQ for asynchronous receipt generation and warehouse notification.',
    spokenTip: 'I separate the architecture by read-heavy traffic (Catalog on Redis/Elasticsearch) versus write-critical transactions (Cart in Redis, Orders in SQL with ACID guarantees).',
    example: {
      language: 'text',
      code: `[Angular 18 SSR / CDN]
         │
         ▼
[Cloudflare Edge / API Gateway]
   ├──> [Catalog Service] ──────> [Redis / Elasticsearch] (Read Heavy)
   ├──> [Cart Service] ─────────> [Redis Hashes TTL: 14d] (Transient R/W)
   └──> [Order/Checkout Service] ─> [PostgreSQL ACID] ──> [RabbitMQ Outbox] ──> [Payment / Fulfillment]`,
      explanation: 'Architectural overview separating read-heavy catalog caching from write-critical ACID order processing.'
    },
    seniorPoint: 'During flash sales (high stock contention), decrement inventory atomically in Redis using a Lua script (`DECRBY stock:sku 1`) before committing the SQL order transaction. This prevents 10,000 users from hitting the database simultaneously when only 5 items remain.',
    followUps: [
      {
        question: 'How do you prevent shopping cart data loss if Redis crashes?',
        answer: 'Configure Redis with AOF (Append-Only File) persistence or Redis Enterprise replication across availability zones, with asynchronous backup snapshots synced to a PostgreSQL secondary table.'
      },
      {
        question: 'How do you handle flash sales where 100,000 users try to buy 100 items at the exact same second?',
        answer: 'Place a virtual waiting room queue (Cloudflare Waiting Room / Redis Token Bucket) in front of the checkout endpoint, and use Redis atomic decrement Lua scripts to serialize inventory claims.'
      }
    ],
    keyPointsToMention: [
      'Separation of Read-heavy Catalog from Write-critical Orders',
      'Cart stored in Redis with TTL for rapid updates',
      'Elasticsearch for full-text product search and faceted filtering',
      'Idempotent checkout and inventory reservation',
      'Asynchronous event-driven order post-processing via RabbitMQ/Kafka'
    ],
    tags: ['System Design', 'E-Commerce', 'Redis', 'Elasticsearch', 'SQL', 'Saga'],
    systemDesignDetails: {
      requirements: {
        functional: [
          'Browse and search product catalog with filters (category, price, rating)',
          'Manage shopping cart (add, update quantity, remove)',
          'Checkout and process payment securely',
          'Order tracking and historical receipt lookup'
        ],
        nonFunctional: [
          'High availability for catalog browsing (99.99%)',
          'Low search latency (< 100ms)',
          'Strong consistency for checkout & stock reservation (no overselling)',
          'PCI-DSS compliance (no raw credit card numbers stored on servers)'
        ]
      },
      architectureOverview: 'Angular frontend served via CDN -> Cloudflare / API Gateway -> Microservices (Catalog Service, Cart Service, Order Service, Payment Service) -> Redis, Elasticsearch, and PostgreSQL.',
      frontendDesign: 'Angular 18+ with SSR for SEO-critical product landing pages, NgRx/Signals for reactive cart state, and optimistic UI updates for cart modifications.',
      apiDesign: 'RESTful API with OpenAPI specs: `GET /api/v1/products?search=...`, `POST /api/v1/cart/items`, `POST /api/v1/checkout` (with Idempotency-Key header).',
      backendServices: 'Catalog Service (.NET 8 with Elasticsearch), Cart Service (.NET 8 with Redis Stack), Order Service (EF Core with PostgreSQL), Notification Service (RabbitMQ consumer).',
      databaseSchema: 'Catalog: Document/JSON & Relational; Cart: Redis Hashes `HSET cart:{userId} {productId} {qty}`; Orders: Relational `Orders`, `OrderItems` with FK constraints and RowVersion.',
      cachingAndPerformance: 'Multi-tiered caching: Browser cache for static assets, Cloudflare Edge Cache for catalog GETs, Redis for product details (TTL 10m) and user carts.',
      messagingAndAsync: 'RabbitMQ / Kafka for `OrderCreated`, `PaymentSuccess`, and `InventoryDeducted` events; Transactional Outbox pattern on Order Service.',
      authAndSecurity: 'OAuth2 / OIDC with JWT bearer tokens for customers; Stripe Elements on frontend for direct-to-gateway PCI compliance.',
      scalabilityAndReliability: 'Horizontal autoscaling of ASP.NET Core pods in Kubernetes; Read replicas for SQL database; Circuit breakers (Polly) on Stripe payment calls.',
      failureScenariosAndMitigations: [
        'Redis Cart cache failure: Fallback to persistent PostgreSQL backup table.',
        'Payment gateway timeout: Poll payment status using Stripe webhook and idempotency token.',
        'Inventory contention on flash sale: Redis atomic decrement `DECRBY stock:{id} 1` with lua script before SQL commit.'
      ],
      tradeOffs: [
        'Eventual consistency in search index updates vs instant real-time stock counts.',
        'Redis in-memory cart speed vs durability in case of catastrophic node failure.'
      ]
    }
  },
  {
    id: 'sys-design-search-autocomplete',
    category: 'systemdesign',
    topic: 'Search & Autocomplete Engine',
    difficulty: 'Strong Mid',
    question: 'System Design: How would you design a high-throughput Search and Autocomplete / Typeahead system?',
    shortAnswer: 'I would use an Angular frontend with RxJS `debounceTime` and `switchMap`, an API Gateway with edge rate limiting, a fast in-memory Trie / Redis prefix cache for top queries, and an Elasticsearch cluster for fuzzy full-text indexing.',
    interviewAnswer: 'For search typeahead, latency is everything—users expect suggestions under 50ms as they type. On the frontend, Angular binds the search input to an RxJS stream using `debounceTime(250)`, `distinctUntilChanged()`, and `switchMap()` to discard stale out-of-order network responses. On the backend, we implement a two-tier architecture: 1) **Tier 1 (Instant Autocomplete)**: An in-memory Trie or Redis Sorted Sets (`ZRANGEBYLEX`) holding the top 100,000 popular search queries and product prefixes for sub-5ms responses. 2) **Tier 2 (Full Search)**: Elasticsearch cluster configured with edge-ngram tokenizers for fuzzy matching, typos, and ranking by popularity score. A background analytics job aggregates click-through rates from Kafka logs nightly to update suggestion rankings.',
    spokenTip: 'On the frontend we use RxJS debounce and switchMap to avoid request flooding, and on the backend we use Redis sorted sets or Elasticsearch edge-ngrams.',
    example: {
      language: 'text',
      code: `[User Input] -> [RxJS: debounce(200) | switchMap()]
                       │
                       ▼ (HTTP GET /api/search?q=iph)
               [API Gateway / CDN]
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
    [Redis Prefix Cache]  [Elasticsearch Cluster]
     - Top 100k queries    - Edge N-Gram analyzer
     - Sub-5ms latency     - Typo tolerance & scoring`,
      explanation: 'Two-tier search architecture: in-memory Redis sorted sets for sub-5ms suggestions and Elasticsearch for full text search.'
    },
    seniorPoint: 'Pre-aggregating popular prefixes into Redis Sorted Sets (`ZADD autocomplete 0 "iphone:100"`) allows the backend to return top 5 suggestions instantly using `ZRANGEBYLEX` without executing full Elasticsearch queries for 90% of user keystrokes.',
    followUps: [
      {
        question: 'How do you handle typo tolerance (e.g. searching for "iphoen" instead of "iphone") in autocomplete?',
        answer: 'In Elasticsearch, use Fuzzy Matching with Levenshtein distance (`fuzziness: "AUTO"`) on the edge-ngram tokenized index.'
      },
      {
        question: 'How do you collect data to rank autocomplete suggestions by real popularity?',
        answer: 'Emit an event to an Apache Kafka topic whenever a user clicks an autocomplete result. A nightly Spark/Flink job calculates click-through rates and updates the popularity weight scores in the index.'
      }
    ],
    keyPointsToMention: [
      'Frontend RxJS operators: debounceTime, distinctUntilChanged, switchMap',
      'Redis Sorted Sets (ZRANGEBYLEX) or Trie for prefix suggestions (<10ms)',
      'Elasticsearch with edge-ngram analyzer for typo tolerance and relevance ranking',
      'Nightly popularity score aggregation via Kafka / Spark',
      'Local browser sessionStorage caching for recent user searches'
    ],
    tags: ['System Design', 'Search', 'Autocomplete', 'Elasticsearch', 'Redis', 'Angular', 'RxJS'],
    systemDesignDetails: {
      requirements: {
        functional: [
          'Real-time autocomplete suggestions as user types',
          'Typo tolerance and prefix matching',
          'Highlighting matching substrings and category recommendations',
          'Personalized recent searches'
        ],
        nonFunctional: [
          'Ultra-low response latency (< 50ms p99)',
          'High throughput (> 50,000 queries/sec)',
          'Graceful degradation under network load'
        ]
      },
      architectureOverview: 'Angular UI (RxJS) -> Cloudflare Edge -> API Gateway -> Redis Suggestions Cache (Trie/ZSET) -> Elasticsearch Cluster (Read) / Kafka Ingestion (Analytics).',
      frontendDesign: 'Custom Search Component using `fromEvent(input, "input") | debounceTime(200) | switchMap(api.search)`. Caches recent queries in Angular memory service.',
      apiDesign: '`GET /api/v1/search/autocomplete?q=ipho&limit=5` and `GET /api/v1/search?q=iphone+15&filters=...` with `Cache-Control: public, max-age=60`.',
      backendServices: 'Search API (.NET 8 with NEST/Elasticsearch client and StackExchange.Redis), Search Ingestion Worker (Kafka Consumer).',
      databaseSchema: 'Elasticsearch index with custom `autocomplete_analyzer` using `edge_ngram` (min_gram: 2, max_gram: 15) and popularity weight field.',
      cachingAndPerformance: 'Client-side LRU cache in Angular service; Redis cache on API gateway for top 10,000 common prefixes.',
      messagingAndAsync: 'Kafka event stream `search-telemetry` capturing user keystrokes and click-through rates for offline ML rank scoring.',
      authAndSecurity: 'Public endpoints protected with rate limiting (100 req/min per IP) to prevent scraper abuse.',
      scalabilityAndReliability: 'Elasticsearch read replicas across availability zones; Redis cluster with read-only replicas.',
      failureScenariosAndMitigations: [
        'Elasticsearch cluster overload: Fallback to Redis static prefix cache.',
        'Network jitter / out-of-order responses: Handled cleanly by RxJS `switchMap` cancelling obsolete HTTP calls.'
      ],
      tradeOffs: [
        'Edge-ngram index storage size vs real-time search speed.',
        'Immediate query suggestion freshness vs pre-computed periodic ranking batches.'
      ]
    }
  },
  {
    id: 'sys-design-realtime-dashboard',
    category: 'systemdesign',
    topic: 'Real-Time Telemetry Dashboard',
    difficulty: 'Strong Mid',
    question: 'System Design: How would you design a Real-Time Dashboard (e.g. live metrics, order updates, IoT telemetry)?',
    shortAnswer: 'I would use an Angular frontend with SignalR / WebSockets, ASP.NET Core SignalR hubs with a Redis Backplane for horizontal scaling, RabbitMQ/Kafka for event ingestion, and a TimescaleDB/InfluxDB time-series database.',
    interviewAnswer: 'For a real-time dashboard displaying thousands of metrics per second, HTTP polling is inefficient. We use a **WebSocket / SignalR** connection. The Angular frontend connects to an ASP.NET Core SignalR Hub. When multiple server instances are deployed in Kubernetes, we use **Redis Backplane** or Azure SignalR Service so that a message broadcast from Server A reaches connected clients on Server B. Incoming data streams from IoT devices or microservices are ingested into Apache Kafka. A .NET streaming worker processes events in batches, updates in-memory live aggregates in Redis, writes time-series historical data to TimescaleDB or PostgreSQL, and broadcasts delta updates over SignalR to the relevant client subscription groups.',
    spokenTip: 'We use SignalR WebSockets with a Redis backplane for horizontal scale, paired with Kafka for stream ingestion and Redis for live metric caching.',
    example: {
      language: 'text',
      code: `[IoT / Microservices] ──> [Kafka Topic: telemetry-raw]
                                  │
                                  ▼
                         [.NET Streaming Worker]
                           ├──> [TimescaleDB] (Historical time-series)
                           └──> [Redis Live State]
                                  │
                                  ▼
                   [ASP.NET Core SignalR Hubs]
                   [Redis Backplane Scale-Out]
                                  │
                                  ▼ (WebSocket / Push)
                       [Angular UI / Signals]`,
      explanation: 'Real-time telemetry pipeline from Kafka ingestion to TimescaleDB storage and SignalR WebSocket broadcast.'
    },
    seniorPoint: 'To prevent UI freezing when handling thousands of WebSocket events per second, buffer incoming SignalR messages in an Angular service and flush updates to the UI at 60fps using `requestAnimationFrame` or RxJS `sampleTime(100ms)`.',
    followUps: [
      {
        question: 'Why is a Redis Backplane necessary when scaling SignalR across multiple server pods?',
        answer: 'WebSocket connections are stateful TCP sockets held on a specific server pod. When Server 1 wants to broadcast an alert to all connected users, without a Redis backplane it cannot reach users whose WebSocket connections are held by Server 2.'
      },
      {
        question: 'How do you handle client authentication during the initial WebSocket handshake?',
        answer: 'Standard browser WebSocket API does not support custom HTTP headers; pass the JWT access token in the query string (`/hub?access_token=...`) and validate it in ASP.NET Core `OnMessageReceived` options.'
      }
    ],
    keyPointsToMention: [
      'WebSocket / ASP.NET Core SignalR for bidirectional push communication',
      'Redis Backplane for scaling SignalR across multiple server nodes',
      'Kafka / Event Hubs for high-throughput metric ingestion',
      'Time-series storage (TimescaleDB / InfluxDB) for historical trend charting',
      'Angular RxJS subjects managing live data buffers without UI freezing'
    ],
    tags: ['System Design', 'Real-Time', 'SignalR', 'WebSockets', 'Redis', 'Angular', 'Kafka'],
    systemDesignDetails: {
      requirements: {
        functional: [
          'Live streaming chart updates without page refresh',
          'User subscription to specific device/project metric groups',
          'Historical date-range query lookup and aggregation',
          'Instant threshold alert push notifications'
        ],
        nonFunctional: [
          'Sub-second message delivery latency (< 200ms)',
          'Support 100,000 concurrent active WebSocket connections',
          'Resilient auto-reconnection on network drops'
        ]
      },
      architectureOverview: 'Angular UI (SignalR Client) <-> Load Balancer (WebSocket pass-through) <-> ASP.NET Core SignalR Hubs <-> Redis Backplane <-> Kafka Stream Ingestion <-> TimescaleDB.',
      frontendDesign: 'Angular SignalR Service with automatic reconnect `withUrl().withAutomaticReconnect()`, feeding into RxJS `BehaviorSubject` with UI throttling via `sampleTime(100ms)` to prevent DOM churn.',
      apiDesign: 'SignalR Hub methods: `JoinGroup(dashboardId)`, `LeaveGroup()`; REST APIs for historical query: `GET /api/v1/metrics/history?start=...&end=...`.',
      backendServices: 'Ingestion Pipeline (.NET Worker with Kafka), Real-time Hub Service (ASP.NET Core SignalR), Metrics Query API (Dapper + TimescaleDB).',
      databaseSchema: 'TimescaleDB hypertables: `metrics (time TIMESTAMPTZ, device_id INT, metric_name VARCHAR, value DOUBLE PRECISION)` indexed on `(device_id, time DESC)`.',
      cachingAndPerformance: 'Redis Stores latest known value `SET metric:current:{deviceId} {json}`; SignalR UI pushes deltas only.',
      messagingAndAsync: 'Kafka topic `device-telemetry-raw` (16 partitions) consumed in parallel worker threads.',
      authAndSecurity: 'JWT token passed in SignalR query string during WebSocket handshake (`access_token` query parameter) and validated in ASP.NET Core middleware.',
      scalabilityAndReliability: 'Azure SignalR Service or Redis Backplane to decouple connection state from backend compute pods.',
      failureScenariosAndMitigations: [
        'Client network drop: SignalR auto-reconnects with exponential backoff and requests catch-up delta.',
        'High incoming telemetry spike: Kafka buffering prevents backend database saturation.'
      ],
      tradeOffs: [
        'Pushing individual events vs micro-batching every 250ms (micro-batching saves CPU and DOM rendering).'
      ]
    }
  },
  {
    id: 'sys-design-large-file-upload',
    category: 'systemdesign',
    topic: 'File Upload & Processing Pipeline',
    difficulty: 'Strong Mid',
    question: 'System Design: How would you design a Resilient Large File Upload System (e.g. 5GB video/dataset uploads)?',
    shortAnswer: 'I would use direct-to-cloud upload via Presigned URLs (AWS S3 or Azure Blob Storage) with client-side chunking / multipart upload, bypassing the web application servers to avoid bandwidth bottlenecks.',
    interviewAnswer: 'Uploading large multi-gigabyte files directly through your ASP.NET Core web server is an anti-pattern—it exhausts server bandwidth, memory buffers, and thread pool workers. Instead, we use **Direct-to-Cloud Presigned URLs with Multipart Upload**. Here is the flow: 1) The Angular frontend splits the file into 10MB chunks using the HTML5 File API Blob slice. 2) Angular calls our ASP.NET Core API (`POST /api/uploads/initiate`) to request presigned upload URLs for each chunk. 3) Angular uploads chunks directly to Azure Blob Storage / S3 in parallel (e.g. 3 concurrent chunk uploads) with pause, resume, and retry on failed chunks. 4) When all chunks finish, Angular calls `POST /api/uploads/complete`. 5) Cloud storage triggers an event (AWS S3 Event / Azure Event Grid) to a background worker queue to assemble, virus scan, and transcode the file.',
    spokenTip: 'Never route large file byte streams through your API servers. Generate Presigned S3/Blob URLs and upload chunks directly from the browser to cloud storage.',
    example: {
      language: 'text',
      code: `[Angular Frontend (5GB File)]
   │ 1. Split into 10MB Chunks via Blob.slice()
   │ 2. POST /api/uploads/initiate
   ▼
[ASP.NET Core API] ──> Returns Presigned S3/Blob URLs
   │
   │ 3. Parallel direct PUT of chunks (bypasses API server!)
   ▼
[Cloud Storage (S3 / Azure Blob)]
   │ 4. S3 Event Grid Notification on Complete
   ▼
[.NET Background Worker (ECS / K8s)] ──> Virus Scan / Transcoding ──> [PostgreSQL DB]`,
      explanation: 'Direct browser-to-cloud upload pipeline using presigned URLs and async event worker processing.'
    },
    seniorPoint: 'Storing uploaded chunk IDs and upload state in browser `IndexedDB` allows users to refresh the page or resume a 4GB upload seamlessly from the exact last uploaded chunk rather than restarting from 0%.',
    followUps: [
      {
        question: 'How do you verify that uploaded chunks are not corrupted in transit?',
        answer: 'Calculate MD5 / SHA-256 checksums per chunk in the browser and pass `Content-MD5` header to S3/Blob Storage; the cloud provider rejects the chunk if the checksum mismatches.'
      },
      {
        question: 'How do you secure access to uploaded private files?',
        answer: 'Keep the S3 bucket completely private and generate time-limited Presigned Download URLs (valid for 15 minutes) only after authenticating user permissions in the API.'
      }
    ],
    keyPointsToMention: [
      'Direct browser-to-cloud upload using Presigned S3/Azure Blob URLs',
      'Client-side chunking (HTML5 File Blob slice) for pause/resume capability',
      'Zero server bandwidth consumption for actual file bytes',
      'Cloud storage event trigger for asynchronous background virus scan and transcoding',
      'Database stores file metadata and processing status'
    ],
    tags: ['System Design', 'File Upload', 'S3', 'Azure Blob', 'Angular', 'Scalability'],
    systemDesignDetails: {
      requirements: {
        functional: [
          'Upload files up to 5GB seamlessly',
          'Pause, resume, and retry interrupted uploads',
          'Progress bar tracking in Angular UI',
          'Virus scanning and metadata generation'
        ],
        nonFunctional: [
          'Zero impact on main web server bandwidth/CPU',
          'High reliability over unstable mobile/wifi conditions',
          'Secure access control (only authorized users can view uploaded files)'
        ]
      },
      architectureOverview: 'Angular (Chunk Uploader) -> API (Generate Presigned URLs) -> Cloud Storage (Direct S3/Blob Multipart Upload) -> Event Grid -> Background Worker (Virus Scan / FFmpeg) -> Database.',
      frontendDesign: 'Angular Upload Service managing chunk queue (`file.slice(start, end)`), concurrency limit of 3, tracking percentage via `HttpEventType.UploadProgress`.',
      apiDesign: '`POST /api/v1/uploads/initialize`, `POST /api/v1/uploads/complete`, `GET /api/v1/files/{id}/download-url` (returns signed download URL with 15-min expiration).',
      backendServices: 'Upload Orchestration API (ASP.NET Core), Processing Consumer (.NET Worker on AWS ECS/Azure Container Apps).',
      databaseSchema: '`Files (Id, UserId, OriginalName, BlobPath, Status [Uploading/Processing/Ready], Size, MimeType, CreatedAt)`.',
      cachingAndPerformance: 'CloudFront / Azure CDN with Signed Cookies for high-speed global media distribution.',
      messagingAndAsync: 'Azure Event Grid / AWS SQS receiving `BlobCreated` events to trigger async pipeline.',
      authAndSecurity: 'Short-lived Presigned URLs (valid for 30 minutes); Asynchronous ClamAV antivirus scanning before marking status as `Ready`.',
      scalabilityAndReliability: 'Unlimited scalability bounded only by cloud storage infrastructure (S3/Azure Blob).',
      failureScenariosAndMitigations: [
        'Network drop during 4GB upload: Angular stores uploaded chunk IDs in IndexedDB; on reconnect, only missing chunks are uploaded.',
        'Corrupted chunk: MD5 / SHA-256 checksum validated per chunk by S3/Azure Blob.'
      ],
      tradeOffs: [
        'Complexity of client-side multipart orchestration vs server upload simplicity.'
      ]
    }
  },
  {
    id: 'sys-design-scalable-angular-dotnet-app',
    category: 'systemdesign',
    topic: 'Full-Stack Enterprise Architecture',
    difficulty: 'Strong Mid',
    question: 'System Design: How would you architect a modern, scalable, high-performance Angular + ASP.NET Core enterprise application?',
    shortAnswer: 'I would structure the frontend using Angular Standalone Components, Signals/NgRx, and Lazy-Loaded Feature Modules behind a Cloudflare CDN. The backend uses ASP.NET Core Clean Architecture (CQRS with MediatR), EF Core with PostgreSQL, Redis for distributed caching, and OpenTelemetry observability.',
    interviewAnswer: 'As a full-stack developer, I design the entire system with clean boundaries: **Frontend (Angular)**: We use standalone components, Angular Signals for local component reactivity, and NgRx for global state. We split the app into lazy-loaded feature modules with route guards and HTTP interceptors for automatic JWT token injection, refresh-token rotation, and global error handling. **Backend (ASP.NET Core)**: We follow **Clean Architecture** with four layers: Domain (entities, business rules), Application (CQRS Commands and Queries using MediatR and FluentValidation), Infrastructure (EF Core DbContext, Redis Cache, External APIs), and Presentation (Minimal APIs / Controllers). We use `AsNoTracking()` and DTO projections for read endpoints, Redis for query caching, and health check endpoints (`/health/live`, `/health/ready`) for Kubernetes orchestration.',
    spokenTip: 'I use Angular Standalone Components with Signals and route-level lazy loading on the frontend, and ASP.NET Core Clean Architecture with CQRS and Redis caching on the backend.',
    example: {
      language: 'text',
      code: `[Angular 18 SPA (Cloudflare CDN / Pages)]
                   │ (HTTPS / REST / SignalR)
                   ▼
       [Cloudflare WAF / Ingress]
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  ASP.NET Core (.NET 8 Clean Architecture)                   │
│   ├── Presentation: Versioned Controllers & ProblemDetails   │
│   ├── Application: MediatR CQRS (Commands/Queries/Validation)│
│   ├── Domain: Core Entities & Domain Events                 │
│   └── Infrastructure: EF Core, Redis Caching, MassTransit    │
└─────────────────────────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
[PostgreSQL Database]  [Redis Cache Cluster]`,
      explanation: 'End-to-end full-stack architecture combining Angular standalone frontend with .NET Clean Architecture backend.'
    },
    seniorPoint: 'Implementing the CQRS pattern with MediatR decouples command write pipelines (with strict validation and transactions) from read query pipelines (which use Dapper or EF Core AsNoTracking with Redis caching) for independent optimization.',
    followUps: [
      {
        question: 'Why should you separate Commands (writes) from Queries (reads) in Clean Architecture?',
        answer: 'Queries are read-only, need no change tracking, and benefit from aggressive caching and flat DTO projections. Commands require business invariants, transactions, validation, and domain event publishing.'
      },
      {
        question: 'How do you handle database migrations safely in zero-downtime Kubernetes deployments?',
        answer: 'Run EF Core database migrations in a dedicated Kubernetes init-container or pre-deployment CI/CD job using expand-and-contract schema design before rolling out new API container pods.'
      }
    ],
    keyPointsToMention: [
      'Angular: Standalone components, Signals, Lazy Loading, HTTP Interceptors for JWT',
      'Backend: Clean Architecture (Domain, Application, Infrastructure, API)',
      'CQRS pattern with MediatR for clean separation of commands and queries',
      'Database & Caching: EF Core with PostgreSQL + Redis distributed caching',
      'Observability & CI/CD: OpenTelemetry, Serilog structured logs, Docker containerization'
    ],
    tags: ['System Design', 'Angular', 'ASP.NET Core', 'Clean Architecture', 'CQRS', 'Full-Stack'],
    systemDesignDetails: {
      requirements: {
        functional: [
          'Enterprise role-based access control (RBAC)',
          'Fast responsive UI with sub-second page loads',
          'Rich data grids with sorting, filtering, and export',
          'Audit trail for all business modifications'
        ],
        nonFunctional: [
          'Frontend initial bundle size < 250KB (lazy loaded)',
          'API response time < 150ms p95',
          'Horizontal scalability in Kubernetes',
          'Complete end-to-end test coverage'
        ]
      },
      architectureOverview: 'Angular 18 SPA (Cloudflare Pages / CDN) -> Cloudflare WAF -> Ingress Nginx -> ASP.NET Core (.NET 8 Clean Architecture) -> PostgreSQL Database & Redis Cluster.',
      frontendDesign: 'Smart/Dumb component pattern, OnPush change detection, Angular Signals for state management, RxJS HTTP services, Tailwind CSS styling.',
      apiDesign: 'RESTful API with OpenAPI/Swagger, RFC 7807 ProblemDetails error responses, and versioned routes `/api/v1/`.',
      backendServices: 'Domain Layer (POCO entities), Application Layer (MediatR Handlers, AutoMapper, FluentValidation), Infrastructure Layer (EF Core, Redis, Email Service), Web API Layer.',
      databaseSchema: 'PostgreSQL relational schema with EF Core Migrations, soft deletes (`IsDeleted`), and `AuditLogs` table tracking user mutations.',
      cachingAndPerformance: 'Redis Cache-Aside pattern for hot reference data; Output Caching in ASP.NET Core for static responses; HTTP ETags for conditional GETs.',
      messagingAndAsync: 'MassTransit with RabbitMQ for background jobs (exporting CSVs, sending transactional emails).',
      authAndSecurity: 'ASP.NET Core Identity + JWT Bearer authentication with HttpOnly Refresh Token cookies; Policy-based authorization handlers.',
      scalabilityAndReliability: 'Stateless API pods autoscale horizontally based on CPU/RAM metrics; Connection pooling with PgBouncer.',
      failureScenariosAndMitigations: [
        'Database failover: Managed PostgreSQL Multi-AZ with automatic read-replica promotion.',
        'Frontend token expiration during form entry: Angular HTTP interceptor silently refreshes token and replays pending request without data loss.'
      ],
      tradeOffs: [
        'Clean Architecture boilerplate vs long-term maintainability and unit-testability.'
      ]
    }
  },
  {
    id: 'sys-design-notification-system',
    category: 'systemdesign',
    topic: 'Multi-Channel Notification System',
    difficulty: 'Strong Mid',
    question: 'System Design: How would you design a scalable Multi-Channel Notification System (Email, Push, SMS, In-App)?',
    shortAnswer: 'I would design an event-driven system with a Notification Gateway, user notification preference engine, priority-based message queues (RabbitMQ/Kafka), dedicated workers for each provider (SendGrid, Twilio, Firebase Cloud Messaging), and SignalR for in-app popups.',
    interviewAnswer: 'A notification system must handle millions of notifications while respecting user preferences, rate limits, and priority levels. The core components are: 1) **Ingestion API**: Other microservices post events like `POST /api/notifications` with payload `{ userId, templateId, data, priority }`. 2) **Preference & Deduplication Engine**: Checks if user disabled SMS or has "Do Not Disturb" on, and checks Redis to deduplicate spam (e.g. not sending 10 emails for 10 comment likes in 1 minute). 3) **Priority Queues**: High-priority (OTP / Password Reset) uses a dedicated high-speed queue; Low-priority (Marketing / Weekly Digest) uses a bulk queue. 4) **Channel Workers**: Scalable .NET workers integrate with third-party providers: SendGrid (Email), Twilio (SMS), FCM/APNs (Mobile/Web Push), and SignalR Hub (live in-app notification bell).',
    spokenTip: 'Separate notification queues by priority so critical OTP codes never wait behind slow bulk marketing emails.',
    example: {
      language: 'text',
      code: `[Internal Microservices] ──> [Notification API]
                                     │
                                     ▼
                    [Preference & Dedup Engine (Redis)]
                                     │
                 ┌───────────────────┼───────────────────┐
                 ▼                   ▼                   ▼
        [Queue: High (OTP)]  [Queue: Normal]     [Queue: Bulk/Marketing]
                 │                   │                   │
                 ▼                   ▼                   ▼
           [SMS Worker]       [Push Worker]       [Email Worker]
             (Twilio)             (FCM)             (SendGrid)
                                                         │
                                               [In-App SignalR Hub]`,
      explanation: 'Event-driven notification system with priority queues isolating time-sensitive OTP codes from bulk marketing.'
    },
    seniorPoint: 'Notification deduplication using Redis: When a user receives high-frequency events (e.g. 50 likes on a photo), set `SETNX notif:like:{userId}:{photoId} 1 EX 300` and aggregate them into a single summary notification ("Sarah and 49 others liked your post") instead of spamming 50 push notifications.',
    followUps: [
      {
        question: 'How do you handle third-party provider rate limits (e.g. Twilio SMS throttling)?',
        answer: 'Use rate-limiting token bucket policies on worker consumers to throttle dispatch rates and buffer messages in the message queue until provider quota refills.'
      },
      {
        question: 'What happens if SendGrid has an outage while sending password reset emails?',
        answer: 'Configure a Polly fallback policy in the Email Worker to automatically switch to a secondary backup provider (like AWS SES or Mailgun) after 3 consecutive failures.'
      }
    ],
    keyPointsToMention: [
      'Priority Queues: Critical OTP codes isolated from bulk marketing emails',
      'User preference engine (channel opt-ins and Do Not Disturb hours)',
      'Rate limiting and deduplication using Redis',
      'Worker pools for third-party providers (SendGrid, Twilio, FCM)',
      'SignalR for live in-app notification bell count'
    ],
    tags: ['System Design', 'Notifications', 'RabbitMQ', 'Redis', 'SignalR', 'Workers'],
    systemDesignDetails: {
      requirements: {
        functional: [
          'Send notifications across Email, SMS, Web Push, and In-App',
          'Template engine with localized variable replacements',
          'User notification preference settings',
          'Delivery status tracking and analytics'
        ],
        nonFunctional: [
          'Sub-second delivery for OTP / Security alerts',
          'High throughput (> 5,000 notifications/sec)',
          'Zero duplicate critical messages'
        ]
      },
      architectureOverview: 'Microservices -> Notification API -> Preference & Dedup Service (Redis) -> RabbitMQ Priority Queues -> Channel Workers (SendGrid, Twilio, FCM, SignalR) -> Database.',
      frontendDesign: 'Angular Notification Bell Component connected to SignalR Hub; Toast notification service for real-time alerts; Notification Center page with infinite scroll.',
      apiDesign: '`POST /api/v1/notifications/send`, `GET /api/v1/notifications/me?unreadOnly=true`, `PUT /api/v1/notifications/preferences`.',
      backendServices: 'Notification Ingestion API (.NET 8), Template Rendering Engine (Fluid / RazorLight), Email Worker, SMS Worker, Push Worker, In-App SignalR Worker.',
      databaseSchema: '`Notifications (Id, UserId, Channel, Title, Body, Status, SentAt, ReadAt)`, `UserPreferences (UserId, EmailEnabled, SmsEnabled, QuietHoursStart, QuietHoursEnd)`.',
      cachingAndPerformance: 'Redis caching for user preferences and notification templates.',
      messagingAndAsync: 'RabbitMQ with 3 queue priorities: `notifications.high` (OTP), `notifications.normal` (Order updates), `notifications.bulk` (Newsletters).',
      authAndSecurity: 'Internal service-to-service authentication via mTLS or API Keys; User endpoints secured via JWT.',
      scalabilityAndReliability: 'Independent worker pod autoscaling based on queue message depth (KEDA).',
      failureScenariosAndMitigations: [
        'SendGrid outage: Worker fails over to backup email provider (AWS SES / Mailgun) via Polly fallback policy.',
        'SMS delivery failure: Message redirected to Dead Letter Queue and retried with exponential backoff.'
      ],
      tradeOffs: [
        'Instant delivery vs batch aggregation (batching 10 likes into 1 email saves provider cost).'
      ]
    }
  }
];
