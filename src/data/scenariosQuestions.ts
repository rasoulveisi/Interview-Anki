import { Question } from '../types';

export const scenariosQuestions: Question[] = [
  {
    id: 'scen-angular-keystroke-flood',
    category: 'scenarios',
    topic: 'Frontend → Backend Optimization',
    difficulty: 'Intermediate',
    question: 'Scenario: An Angular search box is sending an HTTP request on every single keystroke. How would you investigate and fix it?',
    shortAnswer: 'I would replace raw `(input)` event handlers with an RxJS reactive stream using `debounceTime(300)`, `distinctUntilChanged()`, `filter()`, and `switchMap()` to prevent flooding the backend and avoid out-of-order race conditions.',
    interviewAnswer: 'In an interview, I explain that typing "laptop" triggers 6 separate HTTP requests within 1 second if bound directly to an input change event. This causes two huge problems: 1) **Backend Overload**: Hundreds of useless database queries for partial queries like "l", "la", "lap", and 2) **Race Conditions**: If the network is jittery, the response for "la" might arrive *after* the response for "laptop", overwriting the search results with stale data! In Angular, I fix this using RxJS: I bind a `FormControl` or `Subject` to the search input, pipe through `debounceTime(300)` (waits 300ms after user stops typing), `distinctUntilChanged()` (ignores duplicate keystrokes like arrow keys), `filter(text => text.length >= 2)` (avoids 1-letter searches), and `switchMap(term => this.api.search(term))`. `switchMap` is the key operator here because it automatically cancels any pending in-flight HTTP request when a new search term arrives.',
    spokenTip: 'I use an RxJS pipe with debounceTime(300) to wait for the user to pause, and switchMap to automatically cancel outdated pending requests.',
    example: {
      language: 'typescript',
      code: `// Angular 18+ Reactive Search Component
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError } from 'rxjs/operators';
import { AsyncPipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, NgFor],
  template: \`<input [formControl]="searchControl" placeholder="Search products..." />
             <div *ngFor="let item of results$ | async">{{ item.name }}</div>\`
})
export class ProductSearchComponent {
  searchControl = new FormControl('');
  
  results$: Observable<Product[]> = this.searchControl.valueChanges.pipe(
    debounceTime(300),                         // Wait 300ms pause
    distinctUntilChanged(),                    // Only if value actually changed
    filter(term => (term?.length ?? 0) >= 2),  // Minimum 2 characters
    switchMap(term => this.productService.search(term!).pipe(
      catchError(error => {
        console.error(error);
        return of([]);                         // Don't kill the stream on error!
      })
    ))
  );
}`,
      explanation: 'Clean RxJS pipeline using debounceTime and switchMap.'
    },
    seniorPoint: 'Don\'t forget `catchError` inside the `switchMap` inner observable. If you place `catchError` on the outer pipe and an HTTP call fails, the entire Angular search stream completes and stops listening to future keystrokes permanently.',
    followUps: [
      {
        question: 'What is the difference between `switchMap`, `mergeMap`, and `concatMap` for this use case?',
        answer: '`switchMap` cancels the previous HTTP request (perfect for search typeaheads). `mergeMap` runs all requests in parallel (creates race conditions). `concatMap` queues requests sequentially (causes severe lag for user typing).'
      },
      {
        question: 'How do you test this reactive search pipeline in Angular unit tests?',
        answer: 'Use `fakeAsync` and `tick(300)` with `HttpTestingController` to advance the virtual debounce clock and assert that only a single HTTP request was made.'
      }
    ],
    keyPointsToMention: [
      'Problem: Backend CPU overload + Frontend race conditions / out-of-order data',
      'RxJS debounceTime(300) to pause before firing',
      'RxJS distinctUntilChanged() to avoid redundant queries',
      'RxJS switchMap() to automatically cancel stale in-flight HTTP requests',
      'catchError placed inside inner observable to keep stream alive'
    ],
    tags: ['Scenarios', 'Angular', 'RxJS', 'Performance', 'API']
  },
  {
    id: 'scen-api-5-second-latency-investigation',
    category: 'scenarios',
    topic: 'Backend Latency Triage',
    difficulty: 'Strong Mid',
    question: 'Scenario: An API endpoint normally takes 100ms, but intermittently takes 5 seconds to respond. How would you systematically investigate and resolve this?',
    shortAnswer: 'I would check application logs with Correlation IDs, examine Application Performance Monitoring (APM / OpenTelemetry) waterfalls to isolate whether time is spent in SQL queries, external HTTP dependencies, or GC pauses, and check thread pool starvation.',
    interviewAnswer: 'When investigating intermittent 5-second latency, I follow a top-down diagnostic approach: 1) **Network & Gateway**: Look at APM traces (Datadog/AppInsights/Jaeger) to see the end-to-end waterfall breakdown. Is the 5 seconds spent waiting on the network, Kestrel pipeline, database, or external microservice? 2) **Database Layer**: If database time is high, check for SQL Server lock waits, missing indexes, or connection pool exhaustion (default timeout is often 5-15 seconds when all pooled connections are busy). 3) **Downstream HTTP Calls**: Check if the backend is calling an external third-party API (e.g. payment/shipping) without a proper timeout. 4) **.NET Runtime & Threading**: Check for **Thread Pool Starvation** caused by someone calling `.Result` or `.Wait()` on async tasks, or long Garbage Collection (GC) pauses under high memory pressure. 5) **Cold Starts**: If running in serverless / Kubernetes scale-to-zero, verify if it\'s a container cold start.',
    spokenTip: 'I use APM waterfall traces to instantly isolate whether the 5 seconds is spent in the database connection pool, an external API, or thread pool starvation.',
    example: {
      language: 'text',
      code: `Diagnostic Checklist:
1. APM / Distributed Trace Waterfall:
   └── [API Gateway] 5050ms
       └── [ASP.NET Core] 5020ms
           ├── [EF Core SqlConnection.OpenAsync()] 4980ms  <-- BOTTLENECK! (Connection Pool Starvation)
           └── [SELECT * FROM Users] 12ms

Conclusion: DB query took only 12ms, but waiting to GET a connection from the pool took 5 seconds!`,
      explanation: 'APM waterfall revealing connection pool exhaustion rather than query execution time.'
    },
    seniorPoint: 'A classic cause of 5-second spikes in .NET is the ThreadPool injection rate. If worker threads are blocked by synchronous calls (`.Result`), the .NET ThreadPool only creates 1 or 2 new threads per second, taking several seconds to recover.',
    followUps: [
      {
        question: 'How do you detect connection pool leaks in EF Core?',
        answer: 'Check if DbContext is inadvertently registered as Singleton or if raw ADO.NET `SqlConnection` objects are created without a `using` statement or proper async disposal.'
      },
      {
        question: 'How do you configure HTTP timeouts using Polly or HttpClient in .NET?',
        answer: 'Configure `HttpClient.Timeout = TimeSpan.FromSeconds(3)` or apply a Polly `TimeoutPolicy` so slow downstream dependencies fail fast rather than hanging web threads.'
      }
    ],
    keyPointsToMention: [
      'Top-down APM waterfall inspection (Datadog / Application Insights)',
      'Check Database: lock contention, slow execution plans, connection pool exhaustion',
      'Check External dependencies: missing timeouts on downstream HTTP calls',
      'Check .NET ThreadPool starvation caused by sync-over-async (.Result/.Wait)',
      'Check for container cold starts or GC pauses'
    ],
    tags: ['Scenarios', 'Troubleshooting', 'Performance', 'ASP.NET Core', 'APM']
  },
  {
    id: 'scen-frontend-vs-backend-latency-debate',
    category: 'scenarios',
    topic: 'Cross-Team Debugging & Triage',
    difficulty: 'Strong Mid',
    question: 'Scenario: The Frontend team says "The API is slow (3 seconds)", while the Backend team says "The API logs show it took only 40ms". How do you investigate and resolve this disagreement?',
    shortAnswer: 'I would analyze the complete browser Network Timing breakdown (DNS, TLS, TTFB, Content Download), inspect intermediate hops (WAF, CDN, API Gateway), and correlate frontend requests with backend server logs using a shared Correlation ID.',
    interviewAnswer: 'As a full-stack engineer, I bridge this exact gap all the time! Both teams might actually be telling the truth. The backend measures execution time inside the controller (40ms), while the browser measures Total Request-Response Time (3000ms). Here is how I diagnose it: 1) **Browser DevTools Network Tab**: Inspect the **Timing breakdown**: Is the delay in **DNS Lookup**, **Initial Connection (TLS Handshake)**, **TTFB (Time to First Byte)**, or **Content Download**? 2) **Payload Size**: If TTFB is 50ms but Content Download is 2.9 seconds, the backend returned a massive 15MB uncompressed JSON payload. 3) **Intermediate Hops**: If TTFB is 2.9 seconds, the delay is happening in the API Gateway, Cloudflare WAF, or reverse proxy queue before hitting Kestrel. 4) **CORS Preflight**: Check if an un-cached OPTIONS preflight request is taking time. 5) **Correlation ID**: Match the frontend request timestamp and `X-Correlation-ID` against the API Gateway access logs.',
    spokenTip: 'I open browser DevTools to check whether the delay is in TTFB, TLS handshake, or Content Download, and correlate it with the backend via Correlation ID.',
    example: {
      language: 'text',
      code: `Browser DevTools Timing Breakdown Analysis:
- Queueing / Stalled: 1200ms  --> Browser hit the 6-connection-per-domain limit (HTTP/1.1)
- DNS Lookup: 20ms
- Initial Connection (TLS): 80ms
- Request Sent: 2ms
- Waiting for server response (TTFB): 60ms  --> Backend is indeed fast!
- Content Download: 1700ms   --> 12MB JSON payload! Needs Gzip/Brotli compression + pagination!`,
      explanation: 'DevTools timing exposes that connection queuing and payload size caused the 3s delay.'
    },
    seniorPoint: 'Common hidden culprits: 1) Browser connection limits (HTTP/1.1 caps at 6 connections per domain; solve by enabling HTTP/2 multiplexing), 2) Missing Gzip/Brotli response compression, 3) SSL/TLS negotiation latency on slow mobile networks, 4) Un-cached CORS preflight requests on every call.',
    followUps: [
      {
        question: 'How do you cache CORS preflight requests?',
        answer: 'Set the `Access-Control-Max-Age: 86400` header in the backend CORS policy so browsers don\'t repeat OPTIONS preflights for 24 hours.'
      },
      {
        question: 'Why does enabling HTTP/2 resolve browser connection queueing?',
        answer: 'HTTP/2 multiplexes hundreds of concurrent requests over a single TCP connection, eliminating the browser\'s 6-connection-per-domain queueing stall in HTTP/1.1.'
      }
    ],
    keyPointsToMention: [
      'Understand both perspectives: Browser Total Time vs Server Processing Time',
      'Analyze browser Timing tab: DNS, TLS, Stalled, TTFB, Content Download',
      'Identify payload size issues (missing Brotli/Gzip or returning unpaginated arrays)',
      'Check browser 6-connection bottleneck (HTTP/1.1 vs HTTP/2)',
      'Check un-cached CORS preflights (Access-Control-Max-Age)',
      'Correlate via Traceparent / X-Correlation-ID across gateway logs'
    ],
    tags: ['Scenarios', 'Debugging', 'Frontend', 'Backend', 'Networking', 'DevTools']
  },
  {
    id: 'scen-microservice-payment-unavailable-fallback',
    category: 'scenarios',
    topic: 'Microservices Fault Tolerance',
    difficulty: 'Strong Mid',
    question: 'Scenario: Order Service needs to call Payment Service, but Payment Service is temporarily down (503 Service Unavailable). How do you handle this gracefully?',
    shortAnswer: 'I would use a Circuit Breaker to prevent thread exhaustion, queue the payment command asynchronously in RabbitMQ, store the order in `PendingPayment` status, and notify the user that their order is being processed.',
    interviewAnswer: 'In a well-architected distributed system, a temporary outage in a downstream dependency should never crash the entire user checkout experience. Here is my strategy: 1) **Fast Failure via Circuit Breaker**: Polly detects that Payment Service is down and trips the circuit breaker open, failing fast in <5ms instead of waiting for a 30-second timeout. 2) **Asynchronous Fallback via Message Queue**: The Order Service writes the order to the database with status `PaymentPending` and pushes a `ProcessPaymentCommand` message to a durable RabbitMQ / SQS queue. 3) **Client Response**: Return `202 Accepted` to the frontend with `{ orderId: "123", status: "Processing" }`. The Angular UI shows a friendly message: "Your order is received and payment is processing in the background". 4) **Queue Processing**: When Payment Service recovers, background consumer workers drain the queue and process the payments reliably without losing any orders.',
    spokenTip: 'Instead of failing the customer checkout, we accept the order as "PaymentPending", push the payment command to a message queue, and process it when Payment Service recovers.',
    example: {
      language: 'csharp',
      code: `// Graceful Fallback in Order Controller
try
{
    var paymentResult = await _paymentClient.ChargeAsync(orderDto);
    await _orderService.CompleteOrderAsync(orderDto.Id, paymentResult);
    return Ok(new { status = "Completed" });
}
catch (BrokenCircuitException) // Circuit breaker open!
{
    // Fallback: Queue payment command for async processing
    await _messageBus.PublishAsync(new ProcessDeferredPaymentCommand(orderDto));
    await _orderService.MarkOrderPendingAsync(orderDto.Id);
    
    // Return 202 Accepted to UI
    return Accepted(new { 
        status = "Processing", 
        message = "Payment is processing in the background. We will email your confirmation shortly." 
    });
}`,
      explanation: 'Handling downstream outage with Circuit Breaker and asynchronous queue fallback.'
    },
    seniorPoint: 'Ensure you set up Dead Letter Queues (DLQ) with alerting. If a customer\'s card is permanently declined or has insufficient funds when processed from the queue, trigger an automated email to the user with a link to update their payment method.',
    followUps: [
      {
        question: 'What if inventory was reserved but payment fails permanently later?',
        answer: 'Execute a compensating transaction in the Saga to release the reserved inventory back to the warehouse.'
      },
      {
        question: 'How do you inform the frontend in real time when background payment finishes?',
        answer: 'Use SignalR WebSockets: when the background worker completes the payment, broadcast an event to the client\'s connection ID to update the UI from "Processing" to "Confirmed".'
      }
    ],
    keyPointsToMention: [
      'Circuit Breaker (Polly) fails fast to prevent thread pool exhaustion',
      'Asynchronous fallback: save order as Pending and push command to Message Queue',
      'Return 202 Accepted with clear user feedback in UI',
      'Background consumers process queue when Payment Service recovers',
      'Dead Letter Queue (DLQ) and compensating transactions for permanent failures'
    ],
    tags: ['Scenarios', 'Microservices', 'Resilience', 'Circuit Breaker', 'RabbitMQ']
  }
];
