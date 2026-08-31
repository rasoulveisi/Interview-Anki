import { Question } from '../types';

export const apiDesignQuestions: Question[] = [
  {
    id: 'api-resource-naming-conventions',
    category: 'apidesign',
    topic: 'RESTful Resource Modeling',
    difficulty: 'Beginner',
    question: 'What makes a good REST API design, and what are the standard resource naming conventions?',
    shortAnswer: 'A good REST API is resource-oriented, predictable, consistent, uses plural nouns for endpoints, uses standard HTTP methods for actions, returns proper HTTP status codes, and provides standardized error schemas.',
    interviewAnswer: 'In API design, the Golden Rule is that URIs should represent nouns (resources), not actions (verbs). The actions are expressed through standard HTTP methods (GET, POST, PUT, DELETE). For example, use `/api/orders` (plural noun), not `/api/getOrders` or `/api/createOrder`. For nested hierarchical relationships, use natural paths like `/api/orders/{orderId}/items/{itemId}`. Keep naming consistent across the entire API using kebab-case or camelCase, use query parameters for filtering, sorting, and pagination (e.g. `/api/products?category=electronics&sort=-price&page=2`), and always return descriptive JSON payloads with RFC 7807 ProblemDetails for errors.',
    spokenTip: 'URIs should represent nouns, while HTTP methods express the verbs.',
    example: {
      language: 'http',
      code: `// GOOD Resource-Oriented REST API:
GET    /api/v1/customers                -> List customers (with ?page=1&limit=20)
POST   /api/v1/customers                -> Create customer (returns 201 Created)
GET    /api/v1/customers/42             -> Get customer 42
PUT    /api/v1/customers/42             -> Full replace customer 42
PATCH  /api/v1/customers/42             -> Partial update customer 42
DELETE /api/v1/customers/42             -> Delete customer 42 (returns 204)
GET    /api/v1/customers/42/orders      -> List orders for customer 42

// BAD RPC-Style REST API (Anti-pattern):
POST   /api/getAllCustomers
POST   /api/deleteCustomerById?id=42`,
      explanation: 'Clean REST resource hierarchy vs messy RPC URLs.'
    },
    seniorPoint: 'For non-CRUD business actions that don\'t map cleanly to a standard verb (e.g. "Canceling an order" or "Resending an email"), model them as sub-resource state transitions or controllers, such as `POST /api/orders/{id}/cancel` or `POST /api/invoices/{id}/send-email`.',
    followUps: [
      {
        question: 'Should endpoint URLs use plural or singular nouns?',
        answer: 'Plural nouns (`/api/users`, `/api/products`) are the industry standard because `/api/users` represents the collection and `/api/users/{id}` represents a single item in that collection.'
      },
      {
        question: 'How deep should nested resource URLs go?',
        answer: 'Limit nesting to maximum 2 levels deep (e.g. `/orders/{id}/items`). Beyond 2 levels (e.g. `/users/1/orders/2/items/3/taxes`), flatten the endpoint to top-level resources: `/order-items/{id}/taxes`.'
      },
      {
        question: 'What is HATEOAS (Hypermedia As The Engine Of Application State)?',
        answer: 'A REST constraint where API responses include hypermedia links (`_links`) pointing clients to valid subsequent actions (e.g. payment link, cancel link), reducing client-side hardcoded endpoint coupling.'
      }
    ],
    keyPointsToMention: [
      'Resource-oriented: URLs use plural nouns, not verbs',
      'HTTP methods define the actions (GET, POST, PUT, PATCH, DELETE)',
      'Sub-resources model relationships (/users/1/orders)',
      'Query parameters handle filtering, sorting, and pagination',
      'Consistent casing (kebab-case URLs, camelCase JSON properties)'
    ],
    tags: ['API Design', 'REST', 'Architecture', 'Best Practices']
  },
  {
    id: 'api-versioning-strategies-breaking-changes',
    category: 'apidesign',
    topic: 'API Versioning & Compatibility',
    difficulty: 'Strong Mid',
    question: 'How do you handle API Versioning, and what is the difference between Breaking and Non-Breaking changes?',
    shortAnswer: 'API versioning can be done via URI path (`/api/v1/orders`), Query parameter (`/api/orders?v=1.0`), Custom Headers (`X-API-Version: 1.0`), or Content Negotiation (`Accept: application/vnd.mycompany.v1+json`). A breaking change requires existing clients to alter their code, whereas non-breaking changes remain backwards-compatible.',
    interviewAnswer: 'In my experience, **URI Versioning** (`/api/v1/orders`) is the most widely adopted and practical strategy because it is immediately visible in browser URLs, easily cacheable by CDNs, and works seamlessly in OpenAPI/Swagger documentation. Non-breaking changes include: adding a new optional property to a response DTO, adding a new optional query parameter, or adding a new endpoint. Breaking changes include: renaming or removing a field, changing field data types (e.g. string to integer), making an optional parameter required, or altering status code meanings. When breaking changes are unavoidable, we introduce `v2`, maintain `v1` in parallel with a deprecation notice (`Sunset` HTTP header), and coordinate with frontend and mobile teams before decommissioning.',
    spokenTip: 'URI versioning is the clearest for frontend clients and Swagger; never break existing consumers without a new version and deprecation period.',
    example: {
      language: 'csharp',
      code: `// ASP.NET Core API Versioning (Asp.Versioning.Mvc)
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpGet]
    [MapToApiVersion("1.0")]
    public ActionResult<List<OrderDtoV1>> GetV1() => Ok();

    [HttpGet]
    [MapToApiVersion("2.0")]
    public ActionResult<List<OrderDtoV2>> GetV2() => Ok();
}`,
      explanation: 'Asp.Versioning package in ASP.NET Core supporting URL path versioning.'
    },
    seniorPoint: 'To ensure the Angular/React frontend doesn\'t break when the backend adds new fields, frontend TypeScript DTOs should ignore extra unrecognized JSON properties rather than doing strict runtime shape validations on read.',
    followUps: [
      {
        question: 'What is the `Sunset` HTTP Header?',
        answer: 'An HTTP response header (RFC 8594) returning a future date when an API endpoint or version will be permanently shut down.'
      },
      {
        question: 'What are the pros and cons of Header Versioning vs URI Versioning?',
        answer: 'Header versioning keeps URLs clean and REST-pure, but breaks browser URL testing, complicates CDN caching, and makes Postman/Swagger exploration harder.'
      }
    ],
    keyPointsToMention: [
      'URI path versioning (/v1/) vs Header vs Query parameter',
      'Non-breaking: adding optional fields, new endpoints, new query filters',
      'Breaking: renaming/removing fields, changing data types, new mandatory params',
      'Deprecation policy: Sunset headers, parallel version support during transition',
      'Defensive frontend parsing to ignore new unknown fields'
    ],
    tags: ['API Design', 'Versioning', 'Breaking Changes', 'ASP.NET Core', 'Architecture']
  },
  {
    id: 'api-design-order-creation-endpoint',
    category: 'apidesign',
    topic: 'Scenario Design',
    difficulty: 'Strong Mid',
    question: 'How would you design a production-ready API for creating an Order in an e-commerce system?',
    shortAnswer: 'I would create a `POST /api/v1/orders` endpoint accepting an `Idempotency-Key` header, validating input via FluentValidation, using a scoped database transaction to reserve inventory and create the order, and returning a `201 Created` with a `Location` header and created order summary.',
    interviewAnswer: 'Here is how I would design the order creation endpoint in a real ASP.NET Core project: 1) **Endpoint & Contract**: `POST /api/v1/orders` with an `Idempotency-Key` header (UUID) generated by the Angular frontend to prevent duplicate charges on retry. 2) **Request DTO**: Contains customer info, shipping address ID, and an array of items (`sku`, `quantity`). We deliberately omit prices from the client request DTO—prices MUST be fetched server-side from the catalog database to prevent tampering. 3) **Validation**: FluentValidation checks for non-empty items, valid quantities (> 0), and valid addresses (returning 400 or 422 ProblemDetails on failure). 4) **Processing**: Inside a database transaction, check stock availability, decrement inventory, calculate totals with taxes and discounts, and save the order in `PendingPayment` status. 5) **Response**: Return `201 Created` with `Location: /api/v1/orders/ORD-9872` and the created order DTO.',
    spokenTip: 'One critical security rule: never trust product prices sent by the client frontend. Always calculate prices server-side.',
    example: {
      language: 'csharp',
      code: `[HttpPost]
[ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status409Conflict)]
public async Task<IActionResult> CreateOrder(
    [FromBody] CreateOrderRequestDto request,
    [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
    CancellationToken ct)
{
    if (string.IsNullOrEmpty(idempotencyKey))
        return BadRequest(new ProblemDetails { Detail = "Idempotency-Key header is required." });

    var result = await _orderService.CreateOrderAsync(request, idempotencyKey, ct);
    
    return CreatedAtAction(
        nameof(GetOrderById), 
        new { id = result.OrderId }, 
        result
    );
}`,
      explanation: 'Clean order creation endpoint with idempotency and 201 Created response.'
    },
    seniorPoint: 'If payment processing or external courier booking is synchronous and takes 3+ seconds, transition the endpoint to an **Asynchronous Request-Reply pattern**: return `202 Accepted` with a `Location: /api/v1/orders/{id}/status` polling endpoint or push real-time completion status to the Angular frontend via SignalR WebSockets.',
    followUps: [
      {
        question: 'Why should prices never be sent in the client request body?',
        answer: 'Because any user can modify client-side JavaScript or intercept requests via DevTools/Postman and change an item price from $500 to $1.'
      },
      {
        question: 'What is the Asynchronous Request-Reply pattern in REST APIs?',
        answer: 'The server accepts a long-running request, returns `202 Accepted` with a `Location` header to a status check endpoint, and processes the job asynchronously in a background worker.'
      }
    ],
    keyPointsToMention: [
      'POST /api/v1/orders returning 201 Created with Location header',
      'Idempotency-Key header to prevent duplicate orders on network retry',
      'Server-side price calculation (never trust client prices)',
      'Input validation via FluentValidation / ProblemDetails',
      'Transactional inventory reservation',
      '202 Accepted + SignalR for long-running workflows'
    ],
    tags: ['API Design', 'Architecture', 'E-Commerce', 'Scenarios', 'Security']
  },
  {
    id: 'api-design-payment-idempotency-duplicate-charges',
    category: 'apidesign',
    topic: 'Payment & Idempotency',
    difficulty: 'Strong Mid',
    question: 'How do you design a payment API endpoint so duplicate requests (e.g. double-clicking or network timeout retries) do not charge the customer twice?',
    shortAnswer: 'By implementing Idempotency Keys stored in a fast distributed store (like Redis or a SQL unique constraint table). If a request with an existing idempotency key arrives, the server returns the cached initial response without re-executing the payment charge.',
    interviewAnswer: 'Double-charging is a nightmare in payment systems. It happens when a user double-clicks the "Pay" button or when the client times out while the server actually succeeded in charging the card. Here is the architecture: The Angular frontend generates a unique UUID (the `Idempotency-Key`) when the checkout page loads. When calling `POST /api/payments`, this key is passed in the header. On the backend, we check Redis or a `PaymentRequests` database table using an atomic insert or lock: If the key doesn\'t exist, we insert it with status `PROCESSING`. We call the Payment Gateway (Stripe/Adyen) passing the same idempotency key. When the gateway responds, we update our record to `COMPLETED` and cache the response payload. If a duplicate request arrives while `PROCESSING`, we return `409 Conflict` or wait. If it arrives after `COMPLETED`, we simply return the cached response payload immediately without calling the payment gateway again.',
    spokenTip: 'The client sends a unique Idempotency-Key UUID. The server locks the key, processes the payment, stores the result, and replays that result for any duplicate requests.',
    example: {
      language: 'csharp',
      code: `// ASP.NET Core Idempotency Middleware / Service
public async Task<PaymentResultDto> ProcessPaymentAsync(PaymentRequestDto req, string idempotencyKey)
{
    // 1. Check if idempotency key already processed
    var existingRecord = await _db.IdempotentRequests
        .FirstOrDefaultAsync(r => r.Key == idempotencyKey);

    if (existingRecord != null)
    {
        // Replay cached original response
        return JsonSerializer.Deserialize<PaymentResultDto>(existingRecord.ResponseJson)!;
    }

    // 2. Execute Payment with Gateway
    var gatewayResult = await _stripeService.ChargeAsync(req.Amount, req.Currency, idempotencyKey);

    // 3. Save response atomically
    _db.IdempotentRequests.Add(new IdempotentRequest {
        Key = idempotencyKey,
        ResponseJson = JsonSerializer.Serialize(gatewayResult),
        CreatedAt = DateTime.UtcNow
    });
    await _db.SaveChangesAsync();

    return gatewayResult;
}`,
      explanation: 'Server-side idempotency tracking to prevent double charges.'
    },
    seniorPoint: 'On the frontend (Angular), also implement UI-level protection: disable the Submit button immediately on click, display a loading spinner, and prevent multiple clicks using RxJS `exhaustMap` instead of `mergeMap`.',
    followUps: [
      {
        question: 'What is the difference between RxJS `exhaustMap` and `switchMap` for a payment button?',
        answer: '`exhaustMap` ignores all new clicks until the current HTTP request finishes (preventing double submission). `switchMap` cancels the previous request and starts a new one (great for search typeaheads, but dangerous for payments).'
      },
      {
        question: 'How long should idempotency keys be retained in Redis / Database?',
        answer: 'Typically 24 to 48 hours with a TTL. After 24 hours, checkout sessions expire and duplicate attempts should be treated as fresh new transactions.'
      }
    ],
    keyPointsToMention: [
      'Frontend generates unique Idempotency-Key UUID',
      'Backend uses atomic check-and-insert in Redis or SQL table',
      'Pass idempotency key to Payment Gateway (Stripe)',
      'Cache and replay initial response on duplicate calls',
      'Angular UI: disable button, use RxJS exhaustMap to drop duplicate clicks'
    ],
    tags: ['API Design', 'Idempotency', 'Payments', 'Security', 'Angular', 'RxJS']
  },
  {
    id: 'api-rate-limiting-and-protection',
    category: 'apidesign',
    topic: 'Rate Limiting & Throttling',
    difficulty: 'Intermediate',
    question: 'What is Rate Limiting in API design, what algorithms are used, and how is it implemented in ASP.NET Core?',
    shortAnswer: 'Rate Limiting restricts the number of API requests a client can make in a given time window. Common algorithms are Fixed Window, Sliding Window, and Token Bucket. When exceeded, the server returns HTTP 429 Too Many Requests with a `Retry-After` header.',
    interviewAnswer: 'Rate limiting protects your backend APIs from denial-of-service attacks, brute-force login attempts, web scrapers, and accidental client infinite loops. In ASP.NET Core (.NET 7+ built-in `Microsoft.AspNetCore.RateLimiting`), we configure rate limiting middleware with policies: 1) **Fixed Window** (e.g. 100 requests per 1-minute window), 2) **Sliding Window** (smooths out boundary spikes), 3) **Token Bucket** (allows short bursts up to a bucket capacity while refilling tokens steadily), and 4) **Concurrency Limiter** (caps simultaneous active requests). We can partition policies by IP address, authenticated User ID, or API Client Key. If a client exceeds the limit, our API returns `429 Too Many Requests` along with a `Retry-After: 30` header indicating how many seconds the client must wait.',
    spokenTip: 'Rate limiting protects against brute force and abuse by capping requests per time window and returning 429 Too Many Requests.',
    example: {
      language: 'csharp',
      code: `// .NET Built-in Rate Limiting in Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    
    // Policy for public login endpoint (stricter!)
    options.AddFixedWindowLimiter("auth-policy", opt => {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
    });

    // Policy by User ID or IP address
    options.AddSlidingWindowLimiter("api-policy", opt => {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 4;
    });
});

app.UseRateLimiter();

[EnableRateLimiter("auth-policy")]
[HttpPost("api/auth/login")]
public IActionResult Login([FromBody] LoginDto dto) => Ok();`,
      explanation: 'Configuring native rate limiting in ASP.NET Core.'
    },
    seniorPoint: 'In distributed multi-instance container environments (Kubernetes / Cloud Run), in-memory rate limiting only limits requests hitting that specific pod. For true global rate limiting across 20 pods, rate limiting is placed at the API Gateway level (Cloudflare / Nginx / Azure API Management) backed by Redis.',
    followUps: [
      {
        question: 'What is the difference between Fixed Window and Sliding Window rate limiting?',
        answer: 'Fixed Window can allow 2x traffic spikes at window boundaries (e.g. 100 requests at 0:59 and 100 requests at 1:01). Sliding Window divides the window into segments to provide smooth continuous enforcement.'
      },
      {
        question: 'What is the Token Bucket algorithm and when is it best used?',
        answer: 'A bucket holds tokens up to a capacity and refills at a constant rate. Requests consume a token. It allows temporary bursts of traffic while enforcing a steady long-term rate limit.'
      }
    ],
    keyPointsToMention: [
      'Protects APIs from DoS, brute force, and runaway client loops',
      'Algorithms: Fixed Window, Sliding Window, Token Bucket, Concurrency',
      'Returns 429 Too Many Requests + Retry-After header',
      'Built-in ASP.NET Core RateLimiter middleware',
      'Distributed rate limiting via Redis or API Gateways for multi-pod setups'
    ],
    tags: ['Rate Limiting', 'Security', 'API Design', 'ASP.NET Core', 'Performance']
  }
];
