import { Question } from '../types';

export const webQuestions: Question[] = [
  {
    id: 'web-http-basics',
    category: 'web',
    topic: 'HTTP Fundamentals',
    difficulty: 'Beginner',
    question: 'What is HTTP and how does the Request/Response cycle work?',
    shortAnswer: 'HTTP is a stateless application-level protocol running on top of TCP that allows web clients (like browsers or apps) to exchange structured messages with servers using requests and responses.',
    interviewAnswer: 'The way I usually explain HTTP is that it is a client-server conversation. The client sends an HTTP request containing a method (like GET or POST), a target URI, headers with metadata, and an optional body. The server processes that request and returns an HTTP response with a status code (like 200 OK or 404 Not Found), response headers, and typically a JSON or HTML payload. One key detail is that HTTP by itself is stateless—each request is independent, which is why we rely on things like cookies, sessions, or JWT bearer tokens to maintain state across multiple calls.',
    spokenTip: 'The way I usually think about it is that HTTP is a stateless conversation between a client and a server over TCP.',
    example: {
      language: 'http',
      code: `GET /api/users/42 HTTP/1.1
Host: api.myapp.com
Accept: application/json
Authorization: Bearer eyJhbGciOi...

HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 31 Aug 2026 12:00:00 GMT

{ "id": 42, "name": "Sarah Connor", "role": "Admin" }`,
      explanation: 'Notice how the client provides headers for authentication and content negotiation, and the server answers with a status code and payload.'
    },
    seniorPoint: 'In modern architecture, the request goes through multiple hops—DNS resolution, TLS handshakes, reverse proxies or Cloudflare, API Gateways, and finally Kestrel in ASP.NET Core. Understanding connection keep-alive and HTTP multiplexing helps when debugging frontend latency.',
    followUps: [
      {
        question: 'What layer of the OSI model does HTTP operate on?',
        answer: 'It operates at the Application Layer (Layer 7), running over transport protocols like TCP (or UDP in the case of HTTP/3 QUIC).'
      },
      {
        question: 'How do you maintain user state if HTTP is stateless?',
        answer: 'Either through cookies holding session IDs (server-side session store) or stateless JWT tokens sent in the Authorization header on every request.'
      }
    ],
    keyPointsToMention: [
      'Client-server request/response model',
      'Stateless protocol running on TCP/IP',
      'Composed of method, URL, headers, and optional body',
      'Server responds with status code, headers, and body',
      'State managed via cookies or authorization tokens'
    ],
    tags: ['HTTP', 'Basics', 'Networking', 'Web']
  },
  {
    id: 'web-get-vs-post',
    category: 'web',
    topic: 'HTTP Methods',
    difficulty: 'Beginner',
    question: 'What is the difference between GET and POST?',
    shortAnswer: 'GET is designed to retrieve data without modifying server state and is both safe and idempotent. POST is used to submit data to the server to create a new resource or trigger a state change, and is neither safe nor idempotent.',
    interviewAnswer: 'In practice, the main distinction comes down to intent and safety. GET requests should only fetch data. Their parameters are placed in the query string, which makes them cacheable, bookmarkable, and safe to retry automatically if a network glitch happens. POST, on the other hand, puts data inside the request body and is intended to create a new resource or process an action on the server. Because POST modifies state, making the same POST request twice might create two orders or charge a card twice if idempotency is not handled.',
    spokenTip: 'In practice, GET is for reading and is safe to retry, while POST is for creating or submitting data and changes server state.',
    example: {
      language: 'typescript',
      code: `// Angular HttpClient GET (safe, cacheable)
this.http.get<User[]>('/api/users?department=engineering');

// Angular HttpClient POST (creates new record)
this.http.post<User>('/api/users', { name: 'Alex', department: 'Engineering' });`,
      explanation: 'GET parameters go into the URL query string, while POST sends payload in the JSON body.'
    },
    seniorPoint: 'A common mistake is putting sensitive data like passwords or tokens in GET query parameters. Query parameters get logged in web server access logs, browser history, and proxy servers, whereas POST bodies are encrypted inside the TLS tunnel.',
    followUps: [
      {
        question: 'Can a GET request have a body?',
        answer: 'Technically the HTTP spec allows it, but many proxies, CDNs, and libraries either reject it or discard the body, so in real projects we never use a body on GET.'
      }
    ],
    keyPointsToMention: [
      'GET is for reading; POST is for creating/mutating',
      'GET parameters in URL query string; POST data in request body',
      'GET is safe and idempotent; POST is not safe or idempotent',
      'GET responses are easily cached by browsers and CDNs',
      'Security: Avoid sensitive parameters in GET URLs'
    ],
    tags: ['HTTP', 'Methods', 'REST', 'Angular']
  },
  {
    id: 'web-put-vs-patch-vs-post',
    category: 'web',
    topic: 'HTTP Methods',
    difficulty: 'Intermediate',
    question: 'What is the difference between POST, PUT, and PATCH?',
    shortAnswer: 'POST creates a new subordinate resource. PUT replaces the entire existing resource with the provided payload (or creates it if specified by URI), making it idempotent. PATCH applies partial modifications to an existing resource.',
    interviewAnswer: 'The way I usually think about them is: POST is for creating a new entity where the server usually assigns the ID (like POST /api/orders). PUT is a full replacement—you send the entire representation of the resource, and if you leave fields out, they might be overwritten or nulled. PATCH is for partial updates—you only send the fields you actually want to change, like just updating a user\'s email. Another key interview point is idempotency: executing the exact same PUT request 5 times results in the exact same state, whereas repeating a POST might create 5 items.',
    spokenTip: 'I think of PUT as "replace the whole object" and PATCH as "update only these specific fields".',
    example: {
      language: 'typescript',
      code: `// PUT: Send complete updated object
await fetch('/api/users/12', {
  method: 'PUT',
  body: JSON.stringify({ id: 12, name: 'John Doe', email: 'john@work.com', role: 'Dev', active: true })
});

// PATCH: Send only what changed
await fetch('/api/users/12', {
  method: 'PATCH',
  body: JSON.stringify({ email: 'john.new@work.com' })
});`,
      explanation: 'With PATCH you send a delta, preserving the other existing properties on the server.'
    },
    seniorPoint: 'In ASP.NET Core, implementing true PUT requires updating the whole entity or mapping all fields, while PATCH can be done with custom DTOs or JSON Patch (RFC 6902). In practice, many teams use POST or custom PATCH DTOs to avoid full-object overwrites.',
    followUps: [
      {
        question: 'Is PATCH idempotent?',
        answer: 'Strictly speaking, PATCH is not guaranteed to be idempotent by the HTTP spec (e.g. an append patch or increment patch), whereas PUT is always idempotent.'
      }
    ],
    keyPointsToMention: [
      'POST creates new resource (non-idempotent)',
      'PUT replaces entire resource (idempotent)',
      'PATCH updates partial fields (delta updates)',
      'PUT creates identical state when repeated',
      'PATCH payload only contains changed properties'
    ],
    tags: ['HTTP', 'REST', 'API Design', 'Methods']
  },
  {
    id: 'web-idempotency-safety',
    category: 'web',
    topic: 'HTTP Semantics',
    difficulty: 'Intermediate',
    question: 'What does Idempotency mean in HTTP, and what is the difference between Safe and Idempotent methods?',
    shortAnswer: 'A Safe method does not modify any server state (read-only). An Idempotent method can be called multiple times with the exact same effect on server state as calling it once.',
    interviewAnswer: 'In an interview, I always clarify: Safe means read-only—it has no side effects. GET, HEAD, and OPTIONS are safe methods. Idempotent means that making 1 request or making 10 identical requests leaves the server in the exact same state. GET, PUT, and DELETE are idempotent. For example, if you send DELETE /api/products/5 once, it gets deleted. If you send it again, product 5 is still deleted (even if the second response is 404, the database state of product 5 not existing is identical). POST is neither safe nor idempotent.',
    spokenTip: 'The main difference is: Safe means no side effects at all; Idempotent means repeating the request does not change the end state multiple times.',
    example: {
      language: 'text',
      code: `Method   | Safe? (Read-only) | Idempotent? (Repeatable without extra side effects)
---------|-------------------|-----------------------------------------------------
GET      | Yes               | Yes
HEAD     | Yes               | Yes
OPTIONS  | Yes               | Yes
PUT      | No                | Yes (replacing state with X produces X every time)
DELETE   | No                | Yes (deleting item X leaves item X deleted)
POST     | No                | No (submitting order creates multiple orders)
PATCH    | No                | Not necessarily (e.g. increment operation)`,
      explanation: 'Memorizing this table helps instantly during technical interviews.'
    },
    seniorPoint: 'Idempotency is critical for resilient systems. When a network timeout occurs on a payment or order POST endpoint, the frontend cannot know if the server processed the request. We solve this by sending a unique `Idempotency-Key` header so the backend safely ignores duplicates.',
    followUps: [
      {
        question: 'If DELETE returns 200 the first time and 404 the second time, is it still idempotent?',
        answer: 'Yes! Idempotency is about the resulting server/database state, not the HTTP response code. The resource remains deleted in both cases.'
      }
    ],
    keyPointsToMention: [
      'Safe = read-only, no server side effects (GET, HEAD)',
      'Idempotent = N identical calls have same end state as 1 call (GET, PUT, DELETE)',
      'POST is neither safe nor idempotent',
      'DELETE is idempotent even if subsequent status code is 404',
      'Idempotency Keys used to make POST endpoints safely repeatable'
    ],
    tags: ['HTTP', 'Idempotency', 'REST', 'Reliability']
  },
  {
    id: 'web-status-codes-catalog',
    category: 'web',
    topic: 'HTTP Status Codes',
    difficulty: 'Intermediate',
    question: 'Can you walk through the most important HTTP status codes and when to use them?',
    shortAnswer: '2xx means success (200 OK, 201 Created, 204 No Content). 4xx means client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests). 5xx means server error (500 Internal, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout).',
    interviewAnswer: 'I categorize them into ranges: In the 200s, 200 is standard success, 201 Created is used after POST when a new resource is made and includes a Location header, and 204 No Content is great for DELETE or PUT when no body needs to be returned. In the 400s, 400 is malformed request syntax, 401 means unauthenticated (we don\'t know who you are), 403 means forbidden (we know who you are, but you lack permission), 404 is not found, 409 is a business state conflict like duplicate email or concurrency conflict, 422 is semantic validation failure, and 429 is rate limiting. In the 500s, 500 is unhandled code crash, 502 is reverse proxy got invalid response from upstream, 503 is service temporarily down or overloaded, and 504 is upstream timeout.',
    spokenTip: 'A quick rule of thumb: 401 is "who are you?", 403 is "you are not allowed", and 409 is "conflict with current database state".',
    example: {
      language: 'csharp',
      code: `[HttpPost]
public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
{
    if (await _db.Products.AnyAsync(p => p.Sku == dto.Sku))
        return Conflict(new { message = "A product with this SKU already exists" }); // 409

    var product = new Product { Name = dto.Name, Sku = dto.Sku, Price = dto.Price };
    _db.Products.Add(product);
    await _db.SaveChangesAsync();

    return CreatedAtAction(nameof(GetById), new { id = product.Id }, product); // 201
}`,
      explanation: 'ASP.NET Core controllers returning proper HTTP status codes: 409 Conflict for duplicate SKU, 201 Created on success.'
    },
    seniorPoint: 'A key distinction interviewers look for is 401 vs 403, and 502 vs 504. In microservices behind Nginx or Azure API Management, a 504 means the backend container timed out (often a slow SQL query or deadlock), while 502 means the backend container crashed or refused the TCP connection.',
    followUps: [
      {
        question: 'When would you return 204 No Content instead of 200 OK?',
        answer: 'Usually for DELETE requests or void updates where returning a JSON body is unnecessary overhead for the frontend.'
      },
      {
        question: 'What is the difference between 400 and 422?',
        answer: '400 means malformed syntax or unparseable JSON, whereas 422 means valid JSON syntax but failed business validation rules (e.g. age cannot be negative).'
      }
    ],
    keyPointsToMention: [
      '200 OK, 201 Created (with Location header), 204 No Content',
      '401 Unauthorized (unauthenticated) vs 403 Forbidden (authenticated but unauthorized)',
      '404 Not Found, 409 Conflict (concurrency / duplicate key), 429 Rate limited',
      '500 Server error, 502 Bad Gateway (upstream failed), 503 Unavailable, 504 Timeout'
    ],
    tags: ['HTTP', 'Status Codes', 'REST', 'ASP.NET Core']
  },
  {
    id: 'web-cookies-vs-sessions-jwt',
    category: 'web',
    topic: 'State & Authentication',
    difficulty: 'Intermediate',
    question: 'How do Cookies, Sessions, and JWT tokens compare for web applications?',
    shortAnswer: 'Cookies are small key-value pairs stored in the browser and automatically sent on matching HTTP requests. Sessions store user state on the server and link it via a session ID cookie. JWTs are self-contained signed tokens containing claims, allowing stateless verification on any backend service without server session storage.',
    interviewAnswer: 'In traditional web development, a server creates a session in memory or Redis and writes a cookie with a session ID to the browser. The browser sends this cookie on every subsequent request, and the server looks up the user data. With JWTs (JSON Web Tokens), user claims (like user ID and role) are cryptographically signed into the token. The frontend sends it in the Authorization header as `Bearer <token>`. The backend verifies the signature with a secret key without needing a database or Redis lookup on every API call. This makes JWTs naturally suited for microservices and cross-domain SPAs.',
    spokenTip: 'Sessions are stateful on the server; JWTs are stateless because the token itself carries the verified claims.',
    example: {
      language: 'typescript',
      code: `// Angular HTTP Interceptor adding JWT Bearer token
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: \`Bearer \${token}\` }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}`,
      explanation: 'Typical Angular frontend interceptor attaching a Bearer token.'
    },
    seniorPoint: 'Security trade-offs: Storing JWTs in localStorage leaves them vulnerable to XSS. Storing tokens in `HttpOnly; Secure; SameSite=Strict` cookies protects them from JavaScript access (XSS), but requires CSRF protection if using cookies for state-modifying requests. Also, invalidating a JWT before it expires requires a token revocation blacklist (like Redis).',
    followUps: [
      {
        question: 'What are the three parts of a JWT?',
        answer: 'Header (algorithm & token type), Payload (claims like sub, exp, role), and Signature (HMAC or RSA hash of header + payload).'
      },
      {
        question: 'How do you handle JWT expiration smoothly in an Angular app?',
        answer: 'Use short-lived access tokens (e.g., 15 mins) and a long-lived refresh token in an HttpOnly cookie. In the Angular HTTP interceptor, catch 401 errors, call the `/api/refresh-token` endpoint, and retry the failed request.'
      }
    ],
    keyPointsToMention: [
      'Cookies are browser-managed key-value pairs sent automatically',
      'Server Sessions require shared state storage (Redis/memory)',
      'JWTs are stateless, self-contained, digitally signed tokens',
      'Angular HTTP Interceptors attach Bearer tokens',
      'Security: XSS vs CSRF, HttpOnly cookies, token revocation strategies'
    ],
    tags: ['Auth', 'JWT', 'Cookies', 'Security', 'Angular']
  },
  {
    id: 'web-https-tls-http-versions',
    category: 'web',
    topic: 'Protocols & Performance',
    difficulty: 'Strong Mid',
    question: 'How does HTTPS/TLS work, and what are the key differences between HTTP/1.1, HTTP/2, and HTTP/3?',
    shortAnswer: 'HTTPS encrypts HTTP traffic using TLS via symmetric encryption for data and asymmetric public-key cryptography during the initial handshake. HTTP/1.1 introduced keep-alive; HTTP/2 introduced binary framing, multiplexing multiple streams over a single TCP connection, and header compression; HTTP/3 runs on QUIC (UDP) to eliminate TCP head-of-line blocking.',
    interviewAnswer: 'When a browser connects via HTTPS, it performs a TLS handshake: the server provides its SSL certificate with a public key, the browser validates it against trusted Certificate Authorities, and they negotiate a shared symmetric session key (which is much faster for encrypting actual payloads). Regarding protocol versions: in HTTP/1.1, each request needed its own connection or had to wait in line (head-of-line blocking on the connection). HTTP/2 fixed this by multiplexing many concurrent requests over a single TCP connection using binary streams and HPACK header compression. HTTP/3 takes it a step further by replacing TCP with QUIC over UDP, so a dropped packet only stalls its individual stream rather than pausing all multiplexed streams.',
    spokenTip: 'HTTP/1.1 had one request per TCP connection; HTTP/2 multiplexed streams over one TCP connection; HTTP/3 moved to UDP (QUIC) to solve packet loss stalling.',
    example: {
      language: 'text',
      code: `Comparison:
- HTTP/1.1: Text-based, Head-of-line blocking per connection, 6 TCP connections per domain limit in browsers.
- HTTP/2: Binary protocol, Multiplexing (hundreds of requests over 1 TCP connection), HPACK header compression, Server Push.
- HTTP/3: Runs over QUIC protocol (UDP), 0-RTT connection resumption, stream-independent packet recovery.`,
      explanation: 'Multiplexing in HTTP/2 eliminated the old frontend need for CSS sprite sheets and aggressive asset bundling.'
    },
    seniorPoint: 'Because HTTP/2 multiplexes over a single connection, connection pooling on backend reverse proxies and keep-alive headers are crucial. Also, if there is high packet loss on mobile networks, HTTP/2 TCP backoff slows down all requests, whereas HTTP/3 over QUIC isolates packet loss to that single stream.',
    followUps: [
      {
        question: 'What is the difference between asymmetric and symmetric encryption in TLS?',
        answer: 'Asymmetric encryption (public/private key) is used only during the initial handshake to securely exchange the session key. Symmetric encryption (shared AES key) is used for the actual high-speed data transmission.'
      }
    ],
    keyPointsToMention: [
      'TLS handshake uses asymmetric cryptography to exchange symmetric session key',
      'Certificate Authorities validate server identity',
      'HTTP/1.1: persistent connections but head-of-line blocking per connection',
      'HTTP/2: binary framing, stream multiplexing over 1 TCP connection, HPACK',
      'HTTP/3: QUIC over UDP, zero head-of-line blocking across streams on packet loss'
    ],
    tags: ['HTTPS', 'TLS', 'HTTP/2', 'HTTP/3', 'Performance']
  },
  {
    id: 'web-cors-and-preflight',
    category: 'web',
    topic: 'Browser Security & CORS',
    difficulty: 'Intermediate',
    question: 'What is CORS, what causes preflight requests, and how does Same-Origin Policy work?',
    shortAnswer: 'The Same-Origin Policy is a browser security mechanism that prevents JavaScript on one origin from reading data from another origin. CORS (Cross-Origin Resource Sharing) is a server-side header mechanism that tells browsers which foreign origins are permitted to access its resources.',
    interviewAnswer: 'Same-Origin Policy defines an origin by Protocol, Domain, and Port. If my Angular app is on `https://myapp.com:443` and my ASP.NET API is on `https://api.myapp.com:443`, the browser treats this as cross-origin. By default, the browser blocks the frontend from reading the API response unless the API returns headers like `Access-Control-Allow-Origin: https://myapp.com`. For non-simple requests (like requests with `Content-Type: application/json` or custom Authorization headers, or methods like PUT/DELETE), the browser automatically sends an HTTP OPTIONS preflight request first to ask the server: "Do you allow this origin, method, and header?". Only if the server responds with 200/204 and valid CORS headers will the browser send the actual request.',
    spokenTip: 'The most important thing to remember is that CORS is enforced by the browser, not the server. The server processes the request, but the browser blocks JavaScript from reading it if headers are missing.',
    example: {
      language: 'csharp',
      code: `// ASP.NET Core Program.cs CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("https://app.mycompany.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // If sending cookies/auth
    });
});

app.UseCors("FrontendPolicy"); // Must be before app.UseAuthentication()!`,
      explanation: 'Properly configuring CORS in ASP.NET Core middleware.'
    },
    seniorPoint: 'A classic bug: If `app.UseCors()` is placed AFTER `app.UseAuthentication()` or `app.UseAuthorization()`, unauthorized requests will fail before CORS headers get attached, causing the browser to show a confusing "CORS error" instead of a 401/403. Also, Postman and cURL do not enforce CORS because they are not web browsers.',
    followUps: [
      {
        question: 'What constitutes a "simple request" that skips CORS preflight?',
        answer: 'GET, HEAD, or POST with standard headers and Content-Type of only application/x-www-form-urlencoded, multipart/form-data, or text/plain.'
      },
      {
        question: 'Can you use `Access-Control-Allow-Origin: *` with credentials (cookies)?',
        answer: 'No! The browser will reject the response if Allow-Credentials is true and Allow-Origin is wildcard (*). You must specify explicit origins.'
      }
    ],
    keyPointsToMention: [
      'Same-Origin Policy checks protocol, domain, and port',
      'CORS is browser-enforced security; servers allow origins via headers',
      'OPTIONS preflight sent for non-simple requests (JSON, Auth headers, PUT/DELETE)',
      'Middleware order matters in ASP.NET Core (UseCors before UseAuth)',
      'Non-browser tools like Postman do not enforce CORS'
    ],
    tags: ['CORS', 'Security', 'Browser', 'ASP.NET Core', 'Angular']
  },
  {
    id: 'web-rest-vs-rpc-graphql',
    category: 'web',
    topic: 'API Architectures',
    difficulty: 'Strong Mid',
    question: 'What is REST, and how does it compare to RPC (gRPC) and GraphQL?',
    shortAnswer: 'REST is an architectural style based on stateless, resource-oriented URIs and standard HTTP methods. RPC focuses on executing remote functions or actions (verbs). GraphQL is a query language allowing clients to request exact fields across multiple entities in a single POST request.',
    interviewAnswer: 'In my day-to-day work, REST is the industry standard for public web APIs and general frontend-backend communication. In REST, you model nouns (like `/api/orders/10/items`) and manipulate them with standard HTTP verbs (GET, POST, PUT, DELETE). GraphQL is great when the frontend has complex, nested screens with diverse data needs—it prevents over-fetching and under-fetching by letting the client specify the exact shape of the response. RPC (like gRPC using Protocol Buffers over HTTP/2) focuses on actions and high performance, making it ideal for internal microservice-to-microservice communication with strong type contracts and low serialization overhead.',
    spokenTip: 'I think of REST as resource-oriented for web clients, GraphQL as query-driven to solve over-fetching, and gRPC as high-speed binary RPC for backend services.',
    example: {
      language: 'typescript',
      code: `// REST: Multiple round-trips or fixed payloads
// GET /api/users/1
// GET /api/users/1/orders

// GraphQL: Single request asking for exact nested fields
const query = \`
  query GetUserAndOrders($id: ID!) {
    user(id: $id) {
      name
      email
      orders(limit: 5) {
        id
        totalPrice
        status
      }
    }
  }
\`;`,
      explanation: 'GraphQL allows the frontend to fetch user and order details in a single round trip with zero wasted fields.'
    },
    seniorPoint: 'Trade-offs: REST leverages standard HTTP caching (ETags, CDN caches, browser caches) effortlessly. GraphQL breaks standard HTTP caching because all requests are POST to `/graphql`, requiring complex client-side normalization (like Apollo Cache). gRPC is difficult to consume directly from web browsers without gRPC-Web proxies.',
    followUps: [
      {
        question: 'What are the core constraints of REST?',
        answer: 'Statelessness, Client-Server architecture, Cacheability, Uniform Interface, Layered System, and Code on Demand (optional).'
      }
    ],
    keyPointsToMention: [
      'REST: Resource-oriented, HTTP verbs, standard caching',
      'GraphQL: Solves over-fetching/under-fetching, flexible frontend client queries',
      'gRPC/RPC: High-throughput binary protocol buffers, ideal for microservices',
      'Caching trade-offs: REST uses standard HTTP/CDN caching; GraphQL requires application-level caching'
    ],
    tags: ['REST', 'GraphQL', 'gRPC', 'Architecture', 'API Design']
  },
  {
    id: 'web-pagination-offset-vs-cursor',
    category: 'web',
    topic: 'Data Fetching & APIs',
    difficulty: 'Intermediate',
    question: 'What is the difference between Offset Pagination and Cursor-based Pagination?',
    shortAnswer: 'Offset pagination skips a specified number of records using page numbers and page size (e.g. SKIP 20 TAKE 10). Cursor pagination uses a pointer (like an ID or timestamp) to fetch the next set of records after the cursor.',
    interviewAnswer: 'Offset pagination (page=3, pageSize=20) is simple to implement and allows users to jump directly to page 10. However, it has two major flaws: performance degrades on large datasets because the database still has to scan and discard all skipped rows (e.g., `OFFSET 100000`), and data drift happens if an item is inserted while the user is paginating, causing duplicate or skipped items. Cursor pagination (e.g., `afterCursor=eyJpZCI6NDV9` or `lastId=45&limit=20`) uses indexed columns (`WHERE id > 45 ORDER BY id LIMIT 20`). It is lightning-fast on millions of rows and immune to pagination drift, making it ideal for infinite scrolling in Angular/React feeds.',
    spokenTip: 'Offset is easy and lets you jump to arbitrary page numbers, but cursor pagination is much faster for large datasets and infinite scroll.',
    example: {
      language: 'sql',
      code: `-- Offset pagination (slow on large offset, scans 100,000 rows)
SELECT * FROM Orders 
ORDER BY CreatedAt DESC 
OFFSET 100000 ROWS FETCH NEXT 20 ROWS ONLY;

-- Cursor pagination (fast, instant index seek)
SELECT * FROM Orders 
WHERE CreatedAt < '2026-08-30T10:00:00Z' 
ORDER BY CreatedAt DESC 
FETCH NEXT 20 ROWS ONLY;`,
      explanation: 'Cursor pagination performs an indexed seek rather than a sequential scan and discard.'
    },
    seniorPoint: 'In an Angular frontend, with cursor pagination you pass an opaque token returned in the previous page\'s response (e.g., `nextCursor`). The trade-off is that cursor pagination cannot easily jump to an arbitrary page like "Go to Page 15".',
    followUps: [
      {
        question: 'How do you implement cursor pagination with multiple sort fields?',
        answer: 'You create a composite cursor combining fields, like `(CreatedAt, Id)`, so items with identical timestamps can still be deterministically ordered.'
      }
    ],
    keyPointsToMention: [
      'Offset: page/pageSize, OFFSET/FETCH, allows arbitrary page jumping',
      'Offset drawbacks: slow on deep offsets (O(N) row scanning), data drift on real-time inserts',
      'Cursor: uses indexed column pointer (id, timestamp), O(log N) index seek',
      'Cursor is perfect for infinite scroll and high-frequency writes',
      'Cursor cannot jump to arbitrary page numbers'
    ],
    tags: ['Pagination', 'SQL', 'Performance', 'REST', 'Angular']
  }
];
