import { Question } from '../types';

export const dotNetQuestions: Question[] = [
  {
    id: 'dotnet-aspnet-core-overview',
    category: 'dotnet',
    topic: 'ASP.NET Core Architecture',
    difficulty: 'Beginner',
    question: 'What is ASP.NET Core, and how does modern .NET differ from the legacy .NET Framework?',
    shortAnswer: 'ASP.NET Core is a modern, cross-platform, high-performance, open-source framework for building web apps and APIs. Modern .NET (from .NET 5+ to .NET 8/9) is cross-platform, modular, and fast, unlike the Windows-only, monolithic .NET Framework 4.x.',
    interviewAnswer: 'The way I usually explain it is that modern .NET and ASP.NET Core were completely rewritten from the ground up. The old .NET Framework was tightly coupled to Windows and IIS via `System.Web`. Modern .NET runs seamlessly on Linux containers, macOS, and Windows. It features a lightweight Kestrel web server, built-in Dependency Injection, unified configuration, and high-performance asynchronous pipelines (like Span<T> and Memory<T>). In production today, we run ASP.NET Core microservices inside Docker containers on Linux with tiny memory footprints.',
    spokenTip: 'I highlight cross-platform Linux support, built-in DI, the fast Kestrel server, and drastic memory/CPU performance improvements.',
    example: {
      language: 'csharp',
      code: `// Modern .NET Minimal API in Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.MapGet("/api/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));
app.Run();`,
      explanation: 'Modern ASP.NET Core simplified startup with top-level statements and minimal API endpoints.'
    },
    seniorPoint: 'Modern .NET eliminated the GAC (Global Assembly Cache) and machine-wide dependencies; apps are self-contained or framework-dependent deployments easily packaged in Docker Alpine/Debian distroless images.',
    followUps: [
      {
        question: 'What is Kestrel?',
        answer: 'Kestrel is ASP.NET Core\'s cross-platform, event-driven, high-performance web server based on Libuv and managed sockets.'
      }
    ],
    keyPointsToMention: [
      'Cross-platform (Linux, Windows, macOS, Docker containers)',
      'Modern .NET is modular and unified (.NET 8/9 LTS)',
      'Built-in Dependency Injection and configuration system',
      'High-performance Kestrel web server',
      'Lightweight memory footprint compared to legacy System.Web'
    ],
    tags: ['ASP.NET Core', '.NET', 'Architecture', 'C#']
  },
  {
    id: 'dotnet-middleware-pipeline',
    category: 'dotnet',
    topic: 'Request Pipeline & Middleware',
    difficulty: 'Intermediate',
    question: 'How does the ASP.NET Core Request Pipeline work, and why does Middleware order matter?',
    shortAnswer: 'The request pipeline is a series of middleware components executed in a Russian-doll (bidirectional) sequence. Each middleware can inspect the request, pass it to `next()`, and modify the response on the way back. Order matters critically because components depend on earlier processing.',
    interviewAnswer: 'In ASP.NET Core, incoming HTTP requests pass through a sequence of middleware delegates. Think of it as a bidirectional chain: Request flows in through Middleware 1, 2, and 3 to the endpoint, and the response flows back out through 3, 2, and 1. Order is vital! For example, `app.UseCors()` must come before `app.UseAuthentication()`, and `app.UseAuthentication()` must come before `app.UseAuthorization()`. If you put authorization before authentication, the system wouldn\'t know who the user is yet and would reject valid requests. Similarly, exception-handling middleware should be placed at the very top so it can catch unhandled exceptions bubbling up from any downstream component.',
    spokenTip: 'The way I think about it is like a bidirectional Russian doll: the first middleware in is the last middleware out.',
    example: {
      language: 'csharp',
      code: `var app = builder.Build();

// 1. Global Exception Handler (catches errors from everything below)
app.UseExceptionHandler();

// 2. Security & Routing
app.UseHttpsRedirection();
app.UseRouting();

// 3. CORS (before auth!)
app.UseCors("AllowAngularApp");

// 4. Authentication (who are you?)
app.UseAuthentication();

// 5. Authorization (what can you do?)
app.UseAuthorization();

// 6. Endpoint Execution
app.MapControllers();`,
      explanation: 'Standard ASP.NET Core middleware ordering.'
    },
    seniorPoint: 'A custom middleware can short-circuit the pipeline by not calling `await next(context)`. This is how rate-limiting or authentication filters terminate early and return 401 or 429 immediately without wasting CPU invoking downstream controllers.',
    followUps: [
      {
        question: 'What is the difference between Middleware and Action Filters in ASP.NET Core?',
        answer: 'Middleware is global to all HTTP requests at the raw HttpContext level. Filters run inside the MVC/Controller pipeline and have access to MVC-specific context like action parameters, ModelState, and ActionResult.'
      }
    ],
    keyPointsToMention: [
      'Bidirectional pipeline (Request in, Response out)',
      'Next delegate invokes subsequent middleware',
      'Short-circuiting when conditions fail (e.g. rate limit / auth)',
      'Critical order: ExceptionHandler -> CORS -> AuthN -> AuthZ -> Endpoints',
      'Difference from MVC Filters (HttpContext vs ActionContext)'
    ],
    tags: ['Middleware', 'Pipeline', 'ASP.NET Core', 'C#']
  },
  {
    id: 'dotnet-dependency-injection-lifetimes',
    category: 'dotnet',
    topic: 'Dependency Injection',
    difficulty: 'Intermediate',
    question: 'What are the three Dependency Injection lifetimes in ASP.NET Core, and what are their common pitfalls?',
    shortAnswer: 'Transient (new instance every time requested), Scoped (one instance per HTTP request scope), and Singleton (one instance created once and shared across the entire application lifetime).',
    interviewAnswer: 'In ASP.NET Core, we configure services in `IServiceCollection` with three lifetimes: Transient is best for lightweight, stateless services like calculators or formatters. Scoped is used for services that maintain state during an HTTP request—our `DbContext` and repository classes are almost always Scoped so that a single database transaction or entity change tracker is shared throughout that one HTTP request. Singleton is created once when the app starts, which is great for in-memory caches, background queue workers, or HttpClient instances. The biggest pitfall is a **Captive Dependency**: injecting a Scoped service (like `DbContext`) into a Singleton service. That causes the Scoped service to live forever in memory, leading to memory leaks and multithreading concurrency crashes on EF Core.',
    spokenTip: 'Transient is "fresh instance every time", Scoped is "one per HTTP request", and Singleton is "one for the app lifetime". Always beware of captive dependencies.',
    example: {
      language: 'csharp',
      code: `// Service Registration in Program.cs
builder.Services.AddTransient<IEmailValidator, EmailValidator>(); // New instance each time
builder.Services.AddScoped<IOrderRepository, OrderRepository>();   // 1 per HTTP request
builder.Services.AddScoped<AppDbContext>();                        // 1 per HTTP request
builder.Services.AddSingleton<ICacheService, InMemoryCache>();    // 1 shared across app

// PITFALL: Injecting DbContext (Scoped) into a Singleton background worker
// Fix: Inject IServiceScopeFactory into the Singleton and create a scope manually!`,
      explanation: 'Registering lifetimes and understanding how DbContext fits the Scoped lifetime.'
    },
    seniorPoint: 'In ASP.NET Core, the DI container validates scopes in development (`ValidateScopes = true`). If you accidentally resolve a Scoped service from the root provider or from a Singleton, it throws an `InvalidOperationException` at startup, preventing production bugs.',
    followUps: [
      {
        question: 'Why should DbContext NOT be a Singleton?',
        answer: 'DbContext is not thread-safe and tracks entity state in memory. If multiple HTTP requests hit a Singleton DbContext concurrently, it throws concurrency exceptions and leaks memory.'
      },
      {
        question: 'What is the Service Locator anti-pattern?',
        answer: 'Injecting `IServiceProvider` and calling `provider.GetService<T>()` manually inside classes. It hides dependencies, makes unit testing difficult, and bypasses constructor contracts.'
      }
    ],
    keyPointsToMention: [
      'Transient: new instance every resolution',
      'Scoped: one instance per HTTP request (DbContext, Repositories)',
      'Singleton: one instance for entire app lifecycle (Caches, Bus connections)',
      'Captive Dependency: Singleton holding a Scoped reference',
      'Scope validation in ASP.NET Core development environment'
    ],
    tags: ['Dependency Injection', 'ASP.NET Core', 'C#', 'DbContext']
  },
  {
    id: 'dotnet-async-await-threadpool',
    category: 'dotnet',
    topic: 'Asynchronous Programming',
    difficulty: 'Strong Mid',
    question: 'How does async/await work in .NET, what is the Thread Pool, and how do you prevent Thread Starvation?',
    shortAnswer: '`async/await` transforms your method into a compiler-generated state machine. When an asynchronous I/O operation (like a database query or HTTP call) begins, the thread is released back to the Thread Pool to serve other incoming requests, avoiding blocking.',
    interviewAnswer: 'In ASP.NET Core, high throughput depends on not tying up threads during waiting periods. When we call `await _db.Orders.ToListAsync(cancellationToken)`, we are performing non-blocking I/O. The OS kernel and socket handles wait for the database, while our .NET thread is immediately returned to the Thread Pool to process other HTTP requests. When the database responds, an I/O completion port triggers a Thread Pool thread to resume execution at the await point. If developers make the mistake of calling `.Result` or `.Wait()` on an async Task, they synchronously block the thread. Under high traffic, this exhausts all available Thread Pool worker threads—a fatal scenario known as **Thread Pool Starvation**.',
    spokenTip: 'The main goal of async/await in web apps is scalability, not speed. It frees up threads while waiting for I/O so the server can handle 10,000 requests with only a few dozen threads.',
    example: {
      language: 'csharp',
      code: `// GOOD: Asynchronous non-blocking I/O with CancellationToken
[HttpGet("{id}")]
public async Task<ActionResult<OrderDto>> GetOrder(int id, CancellationToken ct)
{
    var order = await _db.Orders
        .AsNoTracking()
        .FirstOrDefaultAsync(o => o.Id == id, ct);

    return order == null ? NotFound() : Ok(_mapper.Map<OrderDto>(order));
}

// BAD (Thread Starvation Anti-pattern):
// var order = _db.Orders.FirstOrDefaultAsync().Result; // BLOCKS THREAD!`,
      explanation: 'Always propagate async all the way down and pass CancellationTokens.'
    },
    seniorPoint: '`CancellationToken` is crucial for performance. When a user navigates away in Angular or cancels an HTTP request, the browser aborts the TCP connection. ASP.NET Core signals the `CancellationToken`, which cancels the underlying SQL query on the database server, saving expensive database CPU.',
    followUps: [
      {
        question: 'What is the difference between `Task` and `ValueTask` in C#?',
        answer: '`Task` is a reference type allocated on the heap. `ValueTask` is a value type struct used for hot paths where the operation often completes synchronously (e.g. from an in-memory cache), avoiding heap allocations.'
      },
      {
        question: 'Does async/await make an individual query run faster?',
        answer: 'No, it actually has tiny state machine overhead. Its benefit is server scalability and throughput, allowing the server to handle vastly more concurrent users.'
      }
    ],
    keyPointsToMention: [
      'Async/await compiles into a state machine',
      'Frees ThreadPool threads during I/O wait times',
      'Thread Starvation caused by .Result, .Wait(), or Task.WaitAll() blocking',
      'CancellationTokens allow cancelling ongoing SQL/HTTP work when client disconnects',
      'Goal is server throughput and scalability, not single-request speed'
    ],
    tags: ['Async', 'Threading', 'C#', 'Performance', 'ASP.NET Core']
  },
  {
    id: 'dotnet-global-exception-handling',
    category: 'dotnet',
    topic: 'Error Handling & Logging',
    difficulty: 'Intermediate',
    question: 'How do you implement Global Exception Handling in modern ASP.NET Core?',
    shortAnswer: 'In modern .NET 8+, we use the `IExceptionHandler` interface combined with `app.UseExceptionHandler()`, returning standardized RFC 7807 ProblemDetails responses while logging structured error details.',
    interviewAnswer: 'In modern ASP.NET Core, we avoid putting repetitive try-catch blocks in every controller action. Instead, we let unhandled exceptions bubble up to a centralized global handler. In .NET 8, we implement the `IExceptionHandler` interface. In its `TryHandleAsync` method, we log the exception with a Correlation ID, map specific domain exceptions (like `NotFoundException` or `ValidationException`) to appropriate HTTP status codes (404, 400, 500), and write a standard RFC 7807 `ProblemDetails` JSON object to the response. In production, we ensure sensitive stack traces and database connection strings are never leaked to the client.',
    spokenTip: 'We use IExceptionHandler to centralize error logging, return RFC 7807 ProblemDetails, and avoid leaking internal stack traces.',
    example: {
      language: 'csharp',
      code: `// .NET 8+ Custom Global Exception Handler
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception ex, CancellationToken ct)
    {
        _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);

        var (status, title) = ex switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Resource Not Found"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid Request Arguments"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected server error occurred")
        };

        var problemDetails = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status == 500 ? "Internal error. Contact support." : ex.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, ct);
        return true;
    }
}`,
      explanation: 'Modern ASP.NET Core IExceptionHandler returning ProblemDetails.'
    },
    seniorPoint: 'Using Serilog with structured logging (e.g. `{UserId}`, `{CorrelationId}`, `{Path}`) allows logs to be indexed in Elasticsearch or Datadog, making it easy to trace an issue from a frontend error notification back to the exact backend log line.',
    followUps: [
      {
        question: 'What is RFC 7807 ProblemDetails?',
        answer: 'A standardized JSON specification for HTTP API error responses containing type, title, status, detail, and instance fields.'
      }
    ],
    keyPointsToMention: [
      'Centralized handling via IExceptionHandler or middleware',
      'RFC 7807 ProblemDetails response standard',
      'Exception mapping to appropriate HTTP status codes',
      'Never expose raw stack traces in production',
      'Structured logging with Correlation IDs for traceability'
    ],
    tags: ['Error Handling', 'Logging', 'ASP.NET Core', 'Security']
  },
  {
    id: 'dotnet-jwt-auth-claims-roles-policies',
    category: 'dotnet',
    topic: 'Authentication & Authorization',
    difficulty: 'Strong Mid',
    question: 'How do Authentication, Authorization, Claims, Roles, and Policies work together in ASP.NET Core?',
    shortAnswer: 'Authentication identifies WHO the user is (e.g. validating a JWT signature). Authorization determines WHAT they can do. Claims are key-value attributes about the user. Policies evaluate one or more claims or custom requirements to grant access.',
    interviewAnswer: 'The way I break it down in an interview is: Authentication happens first. With JWT, the `JwtBearerHandler` validates the token\'s signature, issuer, audience, and expiration. If valid, it constructs a `ClaimsPrincipal` populated with `Claims` (like `sub`, `email`, `role`, `department`). Next is Authorization. While we can use simple Role-based authorization like `[Authorize(Roles = "Admin")]`, modern enterprise applications use **Policy-Based Authorization**. Policies let you define rich requirements, such as requiring a minimum age, a specific department claim, or matching a tenant ID. We write custom `AuthorizationHandler<TRequirement>` to encapsulate clean business security rules.',
    spokenTip: 'Authentication validates identity; Claims are facts about you; Policies are business rules that inspect those claims to grant or deny access.',
    example: {
      language: 'csharp',
      code: `// Program.cs Policy Definition
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("MustBeSeniorFinance", policy =>
        policy.RequireRole("Manager")
              .RequireClaim("Department", "Finance")
              .RequireClaim("ClearanceLevel", "3", "4", "5"));
});

// Applied on Controller or Minimal API
[Authorize(Policy = "MustBeSeniorFinance")]
[HttpPost("approve-budget")]
public IActionResult ApproveBudget() => Ok();`,
      explanation: 'Policy-based authorization combining roles and custom claims.'
    },
    seniorPoint: 'For fine-grained permissions, avoid hardcoding roles. Instead, issue granular permission claims in the JWT (e.g. `permissions: ["orders.read", "orders.refund"]`). This way, frontend feature flags and backend policy checks evaluate the exact same permission keys.',
    followUps: [
      {
        question: 'What is the difference between Access Token and Refresh Token?',
        answer: 'Access tokens are short-lived (e.g. 15 mins) and sent on every API call. Refresh tokens are long-lived, securely stored (HttpOnly cookie or database), and used solely to obtain a new access token without re-prompting for credentials.'
      }
    ],
    keyPointsToMention: [
      'Authentication: validates identity (JwtBearer middleware)',
      'ClaimsPrincipal and Claims (facts about user)',
      'Roles vs Policy-based authorization (Policies are more flexible)',
      'Custom AuthorizationHandler for complex business logic',
      'Short-lived Access Tokens paired with Refresh Tokens'
    ],
    tags: ['Auth', 'JWT', 'Security', 'ASP.NET Core', 'C#']
  },
  {
    id: 'dotnet-options-pattern-config',
    category: 'dotnet',
    topic: 'Configuration & Secrets',
    difficulty: 'Intermediate',
    question: 'What is the Options Pattern in ASP.NET Core, and how do you manage environment-specific configurations and secrets?',
    shortAnswer: 'The Options Pattern binds strongly typed C# classes to configuration sections in `appsettings.json`. For environment configurations, ASP.NET Core merges appsettings.Development.json, Environment Variables, and Azure Key Vault / AWS Secrets Manager.',
    interviewAnswer: 'In ASP.NET Core, we avoid reading raw magic strings from `IConfiguration["Smtp:Host"]`. Instead, we use the Options Pattern. We create a strongly typed class, say `EmailSettings`, and register it using `builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"))`. Then in our services, we inject `IOptions<EmailSettings>` (or `IOptionsSnapshot` if we want configuration reloaded on change without restarting the app). For secrets (like database passwords and API keys), we never commit them to Git. In local development we use the .NET Secret Manager (`dotnet user-secrets`), and in production we inject them via Kubernetes Environment Variables or cloud key vaults.',
    spokenTip: 'The Options Pattern provides strongly typed, validated configuration classes instead of magic strings.',
    example: {
      language: 'csharp',
      code: `// Strongly typed Options class
public class SmtpOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Username { get; set; } = string.Empty;
}

// Program.cs
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));

// Injected into service
public class EmailService
{
    private readonly SmtpOptions _options;
    public EmailService(IOptions<SmtpOptions> options)
    {
        _options = options.Value;
    }
}`,
      explanation: 'Using IOptions<T> for clean, testable configuration.'
    },
    seniorPoint: '`IOptions<T>` is a singleton read once at startup. `IOptionsSnapshot<T>` is scoped and recomputes per HTTP request (great if configuration dynamically updates). `IOptionsMonitor<T>` is a singleton that listens for file change notifications via `OnChange()`.',
    followUps: [
      {
        question: 'In what order does ASP.NET Core load configuration providers?',
        answer: 'appsettings.json -> appsettings.{Environment}.json -> User Secrets (Dev only) -> Environment Variables -> Command line arguments (last one wins).'
      }
    ],
    keyPointsToMention: [
      'Strongly typed configuration classes bound from JSON/Environment',
      'IOptions<T> (static), IOptionsSnapshot<T> (scoped/dynamic), IOptionsMonitor<T> (real-time notifications)',
      'Hierarchical config override order (Environment variables override appsettings.json)',
      'Secret management: dotnet user-secrets in dev, Key Vault/Env vars in prod'
    ],
    tags: ['Configuration', 'Options Pattern', 'ASP.NET Core', 'Best Practices']
  }
];
