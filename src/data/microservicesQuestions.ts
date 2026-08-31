import { Question } from '../types';

export const microservicesQuestions: Question[] = [
  {
    id: 'ms-monolith-vs-microservices',
    category: 'microservices',
    topic: 'Architecture & Trade-offs',
    difficulty: 'Intermediate',
    question: 'What are Microservices, how do they compare to a Monolith, and when should you NOT use them?',
    shortAnswer: 'A Monolith is a single deployable application unit sharing a common codebase and database. Microservices decompose an application into small, independently deployable services organized around business capabilities, each owning its own database. You should NOT use microservices for early-stage startups, small teams, or systems with unclear domain boundaries.',
    interviewAnswer: 'The way I look at microservices is that they are an organizational and scaling solution, not a default architecture. In a Monolith, development is simple initially: one codebase, fast in-memory function calls, and ACID database transactions. However, as the team grows to 50+ engineers, deployments become bottlenecks and scaling individual hot spots requires scaling the entire app. Microservices solve this by giving autonomous teams ownership over small services with independent CI/CD deployment pipelines, distinct tech stacks, and dedicated databases. The trade-off is massive operational complexity: network latency, distributed transactions, eventual consistency, complex debugging, and deployment infrastructure (Kubernetes, service meshes). If a system is small, or domain boundaries are still shifting, a **Modular Monolith** is almost always the better choice.',
    spokenTip: 'Microservices trade code simplicity for operational flexibility. If team size is small or domains are unclear, start with a Modular Monolith.',
    example: {
      language: 'text',
      code: `Comparison:
Feature               | Monolithic Architecture        | Microservices Architecture
----------------------|--------------------------------|------------------------------------
Deployments           | Single artifact, all-or-nothing| Independent per-service pipelines
Communication         | In-memory function calls       | Network calls (HTTP/gRPC/Kafka)
Data Consistency      | Strong ACID transactions       | Eventual consistency & Sagas
Failure Isolation     | A crash takes down everything  | Isolated (failures contained)
Team Autonomy         | Coordinated release schedules  | Independent team ownership
Operational Overhead  | Low                            | High (Kubernetes, Tracing, Meshes)`,
      explanation: 'Clear trade-off matrix between Monoliths and Microservices.'
    },
    seniorPoint: 'A critical anti-pattern is the "Distributed Monolith"—microservices that share a single central database or require coordinated deployments. That gives you all the network latency and deployment pain of microservices without any of the autonomy benefits.',
    followUps: [
      {
        question: 'What is a Modular Monolith?',
        answer: 'A single deployable unit where code is strictly divided into decoupled domain modules with explicit interfaces, allowing easy extraction into microservices later if scaling demands it.'
      }
    ],
    keyPointsToMention: [
      'Microservices: independently deployable services around business domains',
      'Database per service pattern is mandatory to preserve decoupling',
      'Benefits: team autonomy, independent scaling, failure isolation',
      'Drawbacks: distributed transactions, network latency, operational overhead',
      'Avoid microservices when team is small or domain boundaries are unproven'
    ],
    tags: ['Microservices', 'Monolith', 'Architecture', 'System Design', 'Trade-offs']
  },
  {
    id: 'ms-sync-vs-async-messaging',
    category: 'microservices',
    topic: 'Inter-Service Communication',
    difficulty: 'Strong Mid',
    question: 'How does Synchronous communication (REST/gRPC) compare to Asynchronous messaging (RabbitMQ/Kafka)?',
    shortAnswer: 'Synchronous communication (REST/gRPC) blocks the caller waiting for an immediate HTTP response. Asynchronous messaging (RabbitMQ/Kafka) decouples services via a message broker where producers publish events/commands and consumers process them in the background without blocking.',
    interviewAnswer: 'In microservices, relying strictly on synchronous REST calls creates tight coupling and cascading failures—if Service A calls B, which calls C, which calls D, any single timeout or outage brings down the entire user flow. For user-facing reads or commands needing immediate verification (like user authentication), synchronous REST or gRPC makes sense. But for business workflows (like "Order Placed", "Send Email", "Update Inventory", "Process Analytics"), asynchronous messaging is vastly superior. The Order Service publishes an `OrderPlacedEvent` to a message broker (RabbitMQ or Apache Kafka) and immediately returns `202 Accepted` or `201 Created` to the client. Email, Inventory, and Notification consumers pick up the event and process it independently. If the Email Service is down, messages wait safely in the queue without losing data.',
    spokenTip: 'I use synchronous REST/gRPC when the caller needs an immediate answer, and asynchronous event queues for business workflows and background processing.',
    example: {
      language: 'csharp',
      code: `// MassTransit / RabbitMQ Event Publishing in ASP.NET Core
public class OrderService
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task CreateOrderAsync(CreateOrderDto dto)
    {
        // 1. Save locally
        var order = new Order { Id = Guid.NewGuid(), Total = dto.Total };
        await _db.Orders.AddAsync(order);
        await _db.SaveChangesAsync();

        // 2. Publish async event to broker (RabbitMQ/Kafka)
        await _publishEndpoint.Publish<IOrderPlacedEvent>(new
        {
            OrderId = order.Id,
            CreatedAt = DateTime.UtcNow
        });
    }
}`,
      explanation: 'Publishing an event with MassTransit in ASP.NET Core.'
    },
    seniorPoint: 'RabbitMQ is a traditional message broker designed for smart broker, dumb consumer queuing with complex routing and Dead Letter Queues (DLQ). Kafka is a distributed append-only log designed for massive throughput, event streaming, and replayability where consumers track their own offsets.',
    followUps: [
      {
        question: 'What is a Dead Letter Queue (DLQ)?',
        answer: 'A secondary queue where messages that fail processing after maximum retry attempts are redirected for developer inspection and manual replay.'
      },
      {
        question: 'What is the difference between an Event and a Command?',
        answer: 'A Command is an instruction to do something directed to a single handler (e.g. `ChargeCreditCardCommand`). An Event is a notification that something has already happened, broadcast to zero or many subscribers (e.g. `OrderPlacedEvent`).'
      }
    ],
    keyPointsToMention: [
      'Sync (REST/gRPC): blocking, immediate response, tight temporal coupling',
      'Async (RabbitMQ/Kafka): non-blocking, temporal decoupling, resilient to downstream outages',
      'Commands (1 receiver) vs Events (publish/subscribe to many receivers)',
      'RabbitMQ (smart routing / DLQ) vs Kafka (high-throughput distributed log / event stream)',
      'Dead Letter Queue (DLQ) captures poisoned messages'
    ],
    tags: ['Microservices', 'RabbitMQ', 'Kafka', 'Messaging', 'Async', 'ASP.NET Core']
  },
  {
    id: 'ms-circuit-breaker-resilience-polly',
    category: 'microservices',
    topic: 'Resilience & Fault Tolerance',
    difficulty: 'Strong Mid',
    question: 'What is a Circuit Breaker, how does it prevent Cascading Failures, and how do you implement it in .NET with Polly?',
    shortAnswer: 'A Circuit Breaker monitors calls to an external service. When failures exceed a threshold, it "trips" open, immediately failing subsequent requests without calling the failing service. After a cooldown period, it enters "half-open" to test if the service has recovered.',
    interviewAnswer: 'In distributed systems, when downstream Service B experiences high latency or crashes, upstream Service A will keep waiting on timeouts. If 1,000 users arrive, Service A exhausts all its thread pool threads and connection sockets, causing Service A to crash too—this is a **Cascading Failure**. A Circuit Breaker prevents this by acting like an electrical fuse. It has 3 states: 1) **Closed** (normal operation, requests flow through), 2) **Open** (failures crossed threshold, requests fail fast instantly or return fallback data without touching the dying service), and 3) **Half-Open** (after a duration like 30s, lets a few trial requests pass to verify if Service B is healthy). In .NET, we configure Polly circuit breakers and retry policies directly on `HttpClient` via `IHttpClientFactory`.',
    spokenTip: 'The Circuit Breaker fails fast when a downstream service is down so your own service doesn\'t exhaust threads waiting on timeouts.',
    example: {
      language: 'csharp',
      code: `// Polly Circuit Breaker and Retry on HttpClient in Program.cs
builder.Services.AddHttpClient<IPaymentClient, PaymentClient>()
    .AddTransientHttpErrorPolicy(policy => policy
        .WaitAndRetryAsync(3, retryAttempt => 
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)) + TimeSpan.FromMilliseconds(new Random().Next(0, 100)) // Exponential Backoff with Jitter
        ))
    .AddTransientHttpErrorPolicy(policy => policy
        .CircuitBreakerAsync(
            handledEventsAllowedBeforeBreaking: 5,
            durationOfBreak: TimeSpan.FromSeconds(30)
        ));`,
      explanation: 'Configuring Retry with Exponential Backoff + Jitter and Circuit Breaker using Polly in ASP.NET Core.'
    },
    seniorPoint: 'Why **Jitter** is crucial: If 500 requests retry at the exact same exponential interval (1s, 2s, 4s), they all hit the struggling downstream service in synchronized waves—known as the **Thundering Herd** problem. Adding random jitter (e.g. +50ms-200ms randomness) spreads out the retry load.',
    followUps: [
      {
        question: 'What is the Bulkhead Pattern?',
        answer: 'Isolating resources (like separate thread pools or HTTP connection pools) for different services so an outage in one downstream service cannot consume all system resources.'
      }
    ],
    keyPointsToMention: [
      'Cascading failures: thread pool exhaustion from downstream timeouts',
      'Circuit Breaker states: Closed (normal), Open (failing fast), Half-Open (trial)',
      'Polly integration with ASP.NET Core HttpClientFactory',
      'Exponential Backoff + Jitter to prevent Thundering Herd retries',
      'Fallback mechanisms to return cached or default data'
    ],
    tags: ['Resilience', 'Circuit Breaker', 'Polly', 'Microservices', 'ASP.NET Core']
  },
  {
    id: 'ms-distributed-transactions-saga-pattern',
    category: 'microservices',
    topic: 'Distributed Transactions & Sagas',
    difficulty: 'Advanced',
    question: 'How do you handle distributed transactions across multiple microservices, and how does the Saga Pattern work?',
    shortAnswer: 'Because 2-Phase Commit (2PC) is slow and blocking, microservices use the Saga Pattern. A Saga is a sequence of local transactions where each step publishes an event. If a step fails, compensating transactions are executed to undo earlier steps.',
    interviewAnswer: 'In a microservices architecture with a Database-per-Service pattern, you cannot use a single SQL database transaction across services. The Saga Pattern solves this by breaking the workflow into independent local transactions. There are two implementation styles: **Choreography** (decentralized) and **Orchestration** (centralized). In Choreography, services listen to events and trigger their local actions (e.g. Order Service emits `OrderCreated` -> Payment Service charges card and emits `PaymentSuccess` -> Inventory Service reserves items). If Inventory fails (out of stock), it emits `InventoryFailed`, which prompts Payment Service to issue a refund and Order Service to mark the order `Cancelled`. In Orchestration, a central `OrderSagaOrchestrator` coordinates every step and explicitly instructs each service what to do and when to compensate.',
    spokenTip: 'A Saga manages multi-service workflows using local transactions and compensating actions to undo changes if a step fails.',
    example: {
      language: 'text',
      code: `Saga Workflow (Order Placement):
1. [Order Service] Create Order (Status: Pending) -> emits OrderCreated
2. [Payment Service] Charge Customer -> emits PaymentCompleted
3. [Inventory Service] Reserve Stock -> FAILS (Out of stock!) -> emits InventoryFailed
-- COMPENSATING TRANSACTIONS EXECUTE:
4. [Payment Service] Refund Customer (Compensating action)
5. [Order Service] Mark Order as Rejected (Compensating action)`,
      explanation: 'Compensating transactions rolling back state in an eventual consistency model.'
    },
    seniorPoint: 'Compensating transactions are NOT true rollbacks—they are forward semantic undos. For example, you cannot "unsend" an email, but you can send an apology email. Every participating service must be idempotent.',
    followUps: [
      {
        question: 'When is Saga Orchestration preferred over Choreography?',
        answer: 'When the business workflow is complex with many steps (5+ services) or conditional branching. Orchestration prevents "spaghetti event dependencies" and makes the whole flow observable from a single coordinator.'
      }
    ],
    keyPointsToMention: [
      'Database-per-service eliminates 2-phase commit SQL transactions',
      'Saga is a sequence of local transactions coordinated via events',
      'Compensating transactions run in reverse to undo state changes',
      'Choreography (event-driven pub/sub) vs Orchestration (central coordinator)',
      'Requires eventual consistency and idempotent service handlers'
    ],
    tags: ['Saga', 'Distributed Transactions', 'Microservices', 'Architecture', 'Consistency']
  },
  {
    id: 'ms-transactional-outbox-pattern',
    category: 'microservices',
    topic: 'Reliable Messaging Patterns',
    difficulty: 'Strong Mid',
    question: 'What is the Transactional Outbox Pattern, and what critical problem does it solve?',
    shortAnswer: 'The Transactional Outbox Pattern ensures that a database update and publishing an event to a message broker happen atomically without dual-write inconsistency bugs.',
    interviewAnswer: 'In microservices, a classic bug is the "Dual Write" problem: You save an Order to the database and then call `rabbitMQ.Publish(event)`. If the database commit succeeds but the network to RabbitMQ drops right before publishing, the event is lost forever and downstream services never know the order was placed. Conversely, if you publish to RabbitMQ first and the database transaction fails, you told the world an order exists when it doesn\'t! The **Transactional Outbox Pattern** solves this: Inside the SAME database transaction as the business entity, you insert the event into an `Outbox` table. A background worker (using Quartz or .NET BackgroundService) polls the `Outbox` table (or uses Change Data Capture / Debezium) and reliably publishes the messages to RabbitMQ, marking them as published once confirmed.',
    spokenTip: 'The Outbox pattern writes the event into an Outbox table in the exact same SQL transaction as the business data, guaranteeing zero lost messages.',
    example: {
      language: 'csharp',
      code: `// Saving business entity and Outbox message in 1 atomic transaction
using var transaction = await _db.Database.BeginTransactionAsync();

var order = new Order { Id = orderId, CustomerId = customerId, Total = 150 };
_db.Orders.Add(order);

var outboxMessage = new OutboxMessage {
    Id = Guid.NewGuid(),
    Type = nameof(OrderCreatedEvent),
    Payload = JsonSerializer.Serialize(new OrderCreatedEvent(orderId)),
    CreatedAt = DateTime.UtcNow,
    ProcessedAt = null
};
_db.OutboxMessages.Add(outboxMessage);

await _db.SaveChangesAsync();
await transaction.CommitAsync();
// A background worker publishes from OutboxMessages table to RabbitMQ!`,
      explanation: 'Atomic database transaction saving both entity and outbox event.'
    },
    seniorPoint: 'In .NET, libraries like **MassTransit** provide built-in Outbox support for EF Core with just `cfg.AddEntityFrameworkOutbox<AppDbContext>()`, handling background polling, batching, and cleanup automatically.',
    followUps: [
      {
        question: 'What delivery guarantee does the Outbox pattern provide?',
        answer: 'At-least-once delivery. Consumers may receive duplicate messages if the publisher crashes after sending but before updating the Outbox table, so consumers must be idempotent.'
      }
    ],
    keyPointsToMention: [
      'Solves the Dual-Write problem between SQL database and Message Broker',
      'Saves event to Outbox table in same local ACID transaction as entity',
      'Background worker or CDC (Debezium) publishes outbox records to broker',
      'Guarantees at-least-once message delivery',
      'MassTransit provides turnkey EF Core Outbox integration'
    ],
    tags: ['Outbox Pattern', 'Microservices', 'Reliability', 'Messaging', 'EF Core']
  },
  {
    id: 'ms-distributed-tracing-correlation-id',
    category: 'microservices',
    topic: 'Observability & Monitoring',
    difficulty: 'Strong Mid',
    question: 'How do Distributed Tracing and Correlation IDs work, and what is the difference between Metrics, Logs, and Traces (the 3 pillars of observability)?',
    shortAnswer: 'Distributed Tracing tracks a single user request across all downstream microservices by propagating a `TraceId` and `CorrelationId` in HTTP headers. Metrics show system health aggregations (numbers), Logs record discreet events (text/json), and Traces follow the end-to-end request path.',
    interviewAnswer: 'When a user clicks a button in our Angular frontend and the request traverses an API Gateway, Order Service, Payment Service, and SQL database, debugging an error without distributed tracing is nearly impossible. With **Distributed Tracing** (OpenTelemetry / W3C Trace Context), the frontend or API Gateway generates a unique `TraceId` and `CorrelationId`. As the request hops across services via HTTP or Kafka headers (`traceparent`), each service propagates this ID and emits spans. In tools like Jaeger or Datadog, we can see a single waterfall visualization showing the exact millisecond breakdown of where time was spent and which exact service failed. The 3 pillars are: **Metrics** (aggregates like CPU% or 95th-percentile response time), **Logs** (detailed contextual timestamped event records), and **Traces** (the end-to-end journey of a single request across service boundaries).',
    spokenTip: 'Correlation IDs and Traces let you track a single frontend request all the way through 10 backend services in a unified waterfall view.',
    example: {
      language: 'csharp',
      code: `// ASP.NET Core OpenTelemetry Distributed Tracing setup
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddOtlpExporter(opt => opt.Endpoint = new Uri("http://jaeger:4317")));`,
      explanation: 'Configuring OpenTelemetry in ASP.NET Core to automatically trace HTTP and EF Core SQL calls.'
    },
    seniorPoint: 'In Angular, you configure an HTTP interceptor to read the `traceparent` or inject an `X-Correlation-ID` header into outgoing API calls. If the API returns an error response, display the Correlation ID in the UI toast so the user can provide it to tech support for instant lookup in logs.',
    followUps: [
      {
        question: 'What is the W3C Trace Context standard format?',
        answer: 'The `traceparent` header format: `00-{trace-id}-{parent-span-id}-{trace-flags}`.'
      }
    ],
    keyPointsToMention: [
      'Trace ID propagates through HTTP/message headers across all services',
      'OpenTelemetry provides vendor-neutral instrumentation for .NET and web',
      'Three pillars: Metrics (numbers), Logs (discrete events), Traces (request journeys)',
      'Angular HTTP interceptor attaches Correlation ID',
      'Display Correlation ID in error notifications for instant log triage'
    ],
    tags: ['Observability', 'Tracing', 'OpenTelemetry', 'Microservices', 'Angular']
  }
];
