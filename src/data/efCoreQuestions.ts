import { Question } from '../types';

export const efCoreQuestions: Question[] = [
  {
    id: 'efcore-overview-orm',
    category: 'efcore',
    topic: 'EF Core & ORM Fundamentals',
    difficulty: 'Beginner',
    question: 'What is EF Core, what is an ORM, and what is the role of DbContext and DbSet?',
    shortAnswer: 'EF Core is an Object-Relational Mapper (ORM) for .NET. It allows developers to interact with relational databases using C# objects and LINQ instead of writing raw SQL. DbContext represents the database session and unit of work, while DbSet<T> represents a table collection.',
    interviewAnswer: 'The way I explain EF Core is that it bridges the gap between object-oriented C# code and relational SQL tables. An ORM maps our C# domain classes to database tables and handles query generation, parameterization, and transaction management. `DbContext` is the central coordinator: it manages the database connection, tracks changes to loaded entities in memory, and commits them on `SaveChangesAsync()`. `DbSet<T>` represents the table queried via LINQ. One important thing to keep in mind is that DbContext implements both the **Unit of Work** and **Repository** design patterns.',
    spokenTip: 'DbContext is the database session and Unit of Work; DbSet<T> represents the table entity set you query with LINQ.',
    example: {
      language: 'csharp',
      code: `public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Email)
            .IsUnique();
    }
}`,
      explanation: 'DbContext configuration with DbSets and Fluent API model configuration.'
    },
    seniorPoint: 'DbContext is NOT thread-safe and is designed to have a Scoped lifetime per HTTP request. Opening multiple concurrent tasks that query the same DbContext instance will trigger an `InvalidOperationException: A second operation was started on this context instance before a previous operation completed`.',
    followUps: [
      {
        question: 'What design patterns are implemented inside EF Core?',
        answer: 'Unit of Work (via DbContext and SaveChanges), Repository (via DbSet<T>), Identity Map, and Data Mapper.'
      },
      {
        question: 'What is the difference between Fluent API and Data Annotations for entity configuration?',
        answer: 'Data Annotations use C# attributes on entity classes (e.g. `[Required]`, `[MaxLength(50)]`). Fluent API configures mappings in `OnModelCreating`, keeping domain entities pure POCOs without database concerns and supporting advanced mappings like composite keys, shadow properties, and table splitting.'
      },
      {
        question: 'What is DbContext Pooling (`AddDbContextPool`)?',
        answer: 'DbContext Pooling reuses DbContext instances from an internal pool across requests rather than allocating a new instance per HTTP request, reducing memory allocations in high-throughput APIs.'
      }
    ],
    keyPointsToMention: [
      'ORM maps C# objects to relational SQL database schema',
      'DbContext: manages DB connection, unit of work, and change tracker',
      'DbSet<T>: provides LINQ querying interface over a table',
      'DbContext is Scoped and not thread-safe',
      'LINQ expressions are translated into parameterized SQL'
    ],
    tags: ['EF Core', 'ORM', 'DbContext', 'C#', '.NET']
  },
  {
    id: 'efcore-ienumerable-vs-iqueryable',
    category: 'efcore',
    topic: 'LINQ & Query Execution',
    difficulty: 'Intermediate',
    question: 'What is the difference between IEnumerable and IQueryable in C# and EF Core?',
    shortAnswer: '`IQueryable` represents a query whose execution is deferred and translated into SQL by the database provider (server-side filtering). `IEnumerable` represents an in-memory collection where filtering happens in C# application memory (client-side).',
    interviewAnswer: 'This is a classic interview question! `IQueryable` builds an Expression Tree (`Expression<Func<T, bool>>`). When you chain `.Where()` or `.Select()` on an `IQueryable`, it hasn\'t executed anything yet—it simply builds up the SQL statement. When you finally enumerate it (e.g. `await ToListAsync()`), EF Core translates the entire expression into a single optimized SQL query executed on the database server. On the other hand, `IEnumerable` works with compiled delegates (`Func<T, bool>`). If you convert an EF query to `IEnumerable` (e.g. calling `AsEnumerable()` early), the database sends ALL rows over the network to the server, and filtering happens in C# memory. That can quickly crash your server if a table has 500,000 rows!',
    spokenTip: 'The way I usually think about it is: IQueryable filters on the database server via SQL; IEnumerable filters in C# memory on the web server.',
    example: {
      language: 'csharp',
      code: `// GOOD: IQueryable executes WHERE clause on SQL Database Server
// Generates: SELECT * FROM Orders WHERE Status = 'Shipped'
var ordersQuery = _db.Orders.Where(o => o.Status == "Shipped"); 
var results = await ordersQuery.ToListAsync(); // SQL executed here!

// BAD: IEnumerable pulls entire table into RAM before filtering!
// Generates: SELECT * FROM Orders (Transfers 1 million rows over network!)
IEnumerable<Order> allOrders = _db.Orders.AsEnumerable();
var filtered = allOrders.Where(o => o.Status == "Shipped").ToList();`,
      explanation: 'Demonstrating how IQueryable generates server-side SQL vs IEnumerable loading into memory.'
    },
    seniorPoint: 'Deferred Execution means queries aren\'t run until materialized by: `ToListAsync()`, `FirstAsync()`, `CountAsync()`, `AnyAsync()`, or `foreach`. This allows you to dynamically compose search filters and pagination on an `IQueryable` across multiple service methods without hitting the database repeatedly.',
    followUps: [
      {
        question: 'What happens if you use a C# method inside a LINQ where clause that EF Core cannot translate to SQL?',
        answer: 'In modern EF Core 3+, it throws an InvalidOperationException at runtime. (Older versions silently did client evaluation, which caused severe performance bugs).'
      },
      {
        question: 'How do you compose dynamic search queries conditionally with IQueryable?',
        answer: 'Chain `.Where()` calls: `if (!string.IsNullOrEmpty(search)) query = query.Where(p => p.Name.Contains(search));` without calling `ToListAsync()` until all filters are attached.'
      },
      {
        question: 'What is the difference between `FirstAsync()`, `FirstOrDefaultAsync()`, `SingleAsync()`, and `SingleOrDefaultAsync()`?',
        answer: '`FirstAsync` takes the first match and throws if empty; `FirstOrDefaultAsync` returns null if empty. `SingleAsync` generates `TOP 2` SQL and throws if there is more than 1 match; `SingleOrDefaultAsync` throws if more than 1 match exists.'
      }
    ],
    keyPointsToMention: [
      'IQueryable uses Expression Trees to generate server-side SQL',
      'IEnumerable uses in-memory delegates and runs filtering in C# memory',
      'Deferred execution: queries run only when enumerated (ToListAsync, CountAsync)',
      'Premature AsEnumerable() or ToList() causes massive network and memory waste',
      'Dynamic query composition on IQueryable before materialization'
    ],
    tags: ['LINQ', 'IQueryable', 'IEnumerable', 'EF Core', 'Performance', 'C#']
  },
  {
    id: 'efcore-change-tracking-asnotracking',
    category: 'efcore',
    topic: 'Performance & Change Tracking',
    difficulty: 'Intermediate',
    question: 'How does EF Core Change Tracking work, and why should you use AsNoTracking() for read-only queries?',
    shortAnswer: 'EF Core tracks entity property changes in memory by creating snapshot copies when entities are queried. `AsNoTracking()` disables this change tracker, significantly reducing memory allocations and CPU overhead for read-only endpoints.',
    interviewAnswer: 'When EF Core fetches an entity with tracking enabled, it stores a snapshot of the original values in the `ChangeTracker`. When you call `SaveChangesAsync()`, EF compares the current values against the snapshot to generate `UPDATE` SQL statements only for modified columns. For read-only operations (like GET API endpoints returning data to an Angular UI), we never call `SaveChangesAsync()`, so taking snapshots is wasted CPU and memory. By applying `.AsNoTracking()`, EF skips snapshot creation and Identity Map registration, resulting in 30-50% faster query execution and much lower garbage collection pressure.',
    spokenTip: 'In practice, every GET endpoint in our API should use AsNoTracking() because we are only reading data, not modifying it.',
    example: {
      language: 'csharp',
      code: `// Read-only query: Fast, low memory footprint
[HttpGet]
public async Task<ActionResult<List<ProductDto>>> GetProducts()
{
    return await _db.Products
        .AsNoTracking()
        .Where(p => p.IsActive)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .ToListAsync();
}`,
      explanation: 'Using AsNoTracking() on read-only queries.'
    },
    seniorPoint: 'Even better than `AsNoTracking()` alone is combining it with **LINQ Projection (`.Select()`)**. When you project into a DTO (`Select(p => new ProductDto(...))`), EF Core automatically applies no-tracking and only queries the exact columns requested in SQL, avoiding `SELECT *`.',
    followUps: [
      {
        question: 'What is `AsNoTrackingWithIdentityResolution()`?',
        answer: 'It disables change tracking but preserves the Identity Map so that if the same entity appears multiple times in a graph query (e.g. multiple orders having the same customer), only one instance is instantiated in memory.'
      },
      {
        question: 'How can you set `AsNoTracking` globally as the default behavior in DbContext?',
        answer: 'In `OnConfiguring` or DI registration: `options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);`. Individual write operations opt in using `.AsTracking()`.'
      }
    ],
    keyPointsToMention: [
      'Change Tracker keeps snapshots in memory to detect mutations',
      'AsNoTracking() skips snapshot generation and Identity Map overhead',
      'Use AsNoTracking() on all read-only GET endpoints',
      'Projection via .Select() inherently bypasses tracking and optimizes SQL columns',
      'Huge reduction in memory allocation and GC pauses'
    ],
    tags: ['EF Core', 'Change Tracking', 'AsNoTracking', 'Performance', 'Optimization']
  },
  {
    id: 'efcore-loading-strategies-n-plus-1',
    category: 'efcore',
    topic: 'Loading Strategies & N+1 Problem',
    difficulty: 'Strong Mid',
    question: 'What are Eager, Lazy, and Explicit Loading in EF Core, and how do you prevent the N+1 Query Problem?',
    shortAnswer: 'Eager loading loads related data in the initial SQL query using `.Include()`. Lazy loading loads related data automatically when the navigation property is first accessed. Explicit loading loads relations on-demand via `Entry().Collection().Load()`. The N+1 query problem occurs when related entities are loaded inside a loop, triggering N separate database queries.',
    interviewAnswer: 'The N+1 query problem is the number one performance killer in ORMs. If you query 100 Customers and then iterate over them in a `foreach` loop accessing `customer.Orders`, Lazy Loading will issue 1 initial query for customers, followed by 100 individual SQL queries for each customer\'s orders—101 queries total! In practice, we solve this with **Eager Loading** using `.Include(c => c.Orders)` to load them together, or better yet, using **Projection** (`.Select(c => new CustomerDto { Orders = c.Orders.Select(...) })`), which compiles into an efficient single SQL JOIN query. In modern web APIs, we disable Lazy Loading because serializing lazy-loaded navigation properties to JSON causes accidental full database scans and circular serialization loops.',
    spokenTip: 'The N+1 problem means 1 query to get the parent items plus N individual queries for each child. We prevent it using .Include() or LINQ projection.',
    example: {
      language: 'csharp',
      code: `// BAD: N+1 problem (1 query + 100 queries in loop)
var blogs = await _db.Blogs.ToListAsync();
foreach(var blog in blogs) {
    var count = blog.Posts.Count; // Lazy query on every iteration!
}

// GOOD: Eager loading in a single JOIN query
var blogsWithPosts = await _db.Blogs
    .Include(b => b.Posts)
    .AsNoTracking()
    .ToListAsync();

// BEST: Projection (Only pulls exact columns needed)
var blogSummaries = await _db.Blogs
    .Select(b => new BlogSummaryDto(b.Id, b.Title, b.Posts.Count))
    .ToListAsync();`,
      explanation: 'Comparing N+1 Lazy loading vs Eager loading vs LINQ projection.'
    },
    seniorPoint: 'Cartesian Explosion: When eager loading multiple one-to-many collections with multiple `.Include()` calls (e.g. `Orders` and `Addresses` and `PaymentMethods`), a single SQL JOIN duplicates row data exponentially. In EF Core, we use `.AsSplitQuery()` to split the query into a few clean, separate SQL queries per collection.',
    followUps: [
      {
        question: 'When is `.AsSplitQuery()` recommended?',
        answer: 'When eager-loading multiple collections on a single entity to avoid cartesian explosion, while balancing the risk of concurrent data updates between split queries.'
      },
      {
        question: 'What is Filtered Include in EF Core?',
        answer: 'Applying a `.Where()` or `.OrderBy()` inside `.Include()`: `.Include(b => b.Posts.Where(p => p.IsPublished))` to load only a filtered subset of child records.'
      }
    ],
    keyPointsToMention: [
      'Eager (.Include), Lazy (virtual navigation properties), Explicit (.LoadAsync)',
      'N+1 problem: 1 query for parents + N queries for children inside loops',
      'Solution: .Include() or LINQ Projection (.Select)',
      'Avoid Lazy Loading in Web APIs to prevent JSON serialization cascades',
      '.AsSplitQuery() to prevent Cartesian explosion on multiple collection Includes'
    ],
    tags: ['EF Core', 'N+1 Problem', 'Performance', 'LINQ', 'SQL']
  },
  {
    id: 'efcore-vs-dapper-tradeoffs',
    category: 'efcore',
    topic: 'ORM vs Micro-ORM',
    difficulty: 'Strong Mid',
    question: 'How does EF Core compare to Dapper, and when would you choose one over the other?',
    shortAnswer: 'EF Core is a feature-rich full ORM with LINQ translation, change tracking, migrations, and relationship management. Dapper is a lightweight Micro-ORM that maps raw SQL query results directly into C# POCO objects with near-native ADO.NET performance.',
    interviewAnswer: 'In my experience, EF Core and Dapper complement each other well. EF Core provides high developer productivity: strongly typed LINQ queries, automatic SQL generation, schema migrations, and entity change tracking for complex write operations and transactions. Dapper, on the other hand, gives you 100% control over the exact raw SQL query and has almost zero execution overhead. In a typical modern architecture, we often use EF Core for domain modeling, transactional writes, and standard CRUD operations, while using Dapper (or EF Core Raw SQL / compiled queries) for heavy reporting queries, complex SQL window functions, or ultra-high-throughput read endpoints.',
    spokenTip: 'I prefer EF Core for developer velocity, migrations, and transactional writes, but Dapper for raw SQL control and maximum read performance.',
    example: {
      language: 'csharp',
      code: `// Dapper high-performance query
using var connection = new SqlConnection(_connectionString);
var highSpenders = await connection.QueryAsync<CustomerReportDto>(
    @"SELECT c.Id, c.Name, SUM(o.Total) AS TotalSpent
      FROM Customers c
      INNER JOIN Orders o ON c.Id = o.CustomerId
      GROUP BY c.Id, c.Name
      HAVING SUM(o.Total) > @MinSpend",
    new { MinSpend = 5000 });`,
      explanation: 'Dapper executing raw SQL with direct POCO mapping.'
    },
    seniorPoint: 'With EF Core 7 and 8+, features like `ExecuteUpdateAsync()` and `ExecuteDeleteAsync()` allow bulk operations without loading entities into memory first, closing much of the historical performance gap with Dapper.',
    followUps: [
      {
        question: 'Can you use EF Core and Dapper together in the same project?',
        answer: 'Yes! Both can share the same database connection and transaction via `_dbContext.Database.GetDbConnection()`.'
      },
      {
        question: 'What are EF Core Compiled Queries (`EF.CompileAsyncQuery`)?',
        answer: 'A technique that compiles LINQ expression trees into delegate functions once, skipping the expression tree parsing overhead on subsequent query executions for sub-millisecond hot paths.'
      }
    ],
    keyPointsToMention: [
      'EF Core: Full ORM, LINQ, Change Tracking, Unit of Work, Migrations',
      'Dapper: Micro-ORM, raw SQL, direct object mapping, minimal CPU/memory overhead',
      'CQRS pattern: EF Core for commands (writes), Dapper for complex queries (reads)',
      'EF Core 7/8 bulk operations: ExecuteUpdateAsync and ExecuteDeleteAsync'
    ],
    tags: ['EF Core', 'Dapper', 'Performance', 'Architecture', 'SQL']
  },
  {
    id: 'efcore-concurrency-optimistic-vs-pessimistic',
    category: 'efcore',
    topic: 'Transactions & Concurrency',
    difficulty: 'Strong Mid',
    question: 'How do you handle Concurrency Conflicts in EF Core, and what is the difference between Optimistic and Pessimistic Concurrency?',
    shortAnswer: 'Pessimistic concurrency locks the database row while reading (preventing others from reading/writing). Optimistic concurrency allows concurrent reads/writes and checks a Concurrency Token (like a `RowVersion` timestamp) on update, throwing a `DbUpdateConcurrencyException` if data was modified by another user.',
    interviewAnswer: 'In modern web applications, we almost exclusively use **Optimistic Concurrency** because holding database locks across HTTP requests (pessimistic) destroys scalability. In EF Core, we configure a concurrency token on the entity using `[Timestamp]` or `IsRowVersion()` in Fluent API. When EF Core generates an UPDATE statement, it appends `WHERE Id = @id AND RowVersion = @originalRowVersion`. If someone else updated the record in the meantime, the `RowVersion` won\'t match, zero rows will be updated, and EF Core throws a `DbUpdateConcurrencyException`. In our API, we catch this exception and return a 409 Conflict to the frontend, allowing the user to inspect the latest changes and resolve the conflict.',
    spokenTip: 'Optimistic concurrency detects conflicts at save time using a RowVersion column; if someone changed the row first, EF Core throws a DbUpdateConcurrencyException.',
    example: {
      language: 'csharp',
      code: `// Entity with RowVersion token
public class BankAccount
{
    public int Id { get; set; }
    public decimal Balance { get; set; }
    
    [Timestamp] // Concurrency Token in SQL Server (byte[] rowversion)
    public byte[] Version { get; set; } = null!;
}

// Handling in Controller:
try
{
    await _db.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException ex)
{
    // Return 409 Conflict to Angular UI with fresh server values
    return Conflict(new { message = "Record was modified by another user. Please refresh." });
}`,
      explanation: 'Handling DbUpdateConcurrencyException in ASP.NET Core.'
    },
    seniorPoint: 'In disconnected architectures (Angular frontend + REST API), you must pass the `RowVersion` or `LastModifiedAt` timestamp from the frontend DTO back to the backend update request, attaching it to the entity so EF Core can compare against the database version.',
    followUps: [
      {
        question: 'When would you still use Pessimistic locking?',
        answer: 'In high-contention financial systems or ticket reservations where conflicts are extremely frequent and retrying optimistic transactions would cause excessive rollbacks.'
      },
      {
        question: 'How do you implement client-wins or database-wins conflict resolution in EF Core?',
        answer: 'Catch `DbUpdateConcurrencyException`, call `entry.GetDatabaseValuesAsync()`, and overwrite either current values with database values (store-wins) or refresh the original version snapshot and call `SaveChanges` again (client-wins).'
      }
    ],
    keyPointsToMention: [
      'Pessimistic concurrency: DB row/table locks (low scalability)',
      'Optimistic concurrency: uses RowVersion / concurrency token in WHERE clause',
      'DbUpdateConcurrencyException thrown when rows affected is 0',
      'Returns 409 Conflict to client to trigger merge or reload',
      'Crucial for stateless REST API transactions'
    ],
    tags: ['EF Core', 'Concurrency', 'Transactions', 'Database', 'ASP.NET Core']
  },
  {
    id: 'efcore-bulk-operations',
    category: 'efcore',
    topic: 'Bulk Operations (ExecuteUpdate & ExecuteDelete)',
    difficulty: 'Senior',
    question: 'How do ExecuteUpdateAsync and ExecuteDeleteAsync in EF Core 7/8 perform bulk database modifications, and how do they differ from traditional SaveChangesAsync?',
    shortAnswer: '`ExecuteUpdateAsync` and `ExecuteDeleteAsync` translate directly into single SQL `UPDATE` and `DELETE` commands executed on the database server without loading entities into memory or attaching them to the `ChangeTracker`. This runs orders of magnitude faster ($O(1)$ network roundtrip) for bulk operations than the traditional approach of loading 10,000 entities into RAM and calling `SaveChangesAsync()`.',
    interviewAnswer: 'Historically, doing bulk updates in EF Core required fetching entities into memory, modifying properties on each C# object, and calling `SaveChangesAsync()`. If updating 10,000 records, this meant downloading 10,000 rows into RAM, creating 10,000 change tracker snapshots, and executing 10,000 individual SQL statements or a massive batch.\n\nIn EF Core 7 and 8+:\n1. **`ExecuteUpdateAsync`**: Generates a direct SQL `UPDATE Users SET Status = \\\'Inactive\\\' WHERE LastLogin < @date` on the database server.\n2. **`ExecuteDeleteAsync`**: Generates a direct SQL `DELETE FROM AuditLogs WHERE CreatedAt < @cutoff`.\n3. **Trade-offs & Warnings**:\n   - Because entities bypass the `ChangeTracker`, in-memory entity instances are NOT updated.\n   - Database interceptors and entity events (like auditing timestamps in `SaveChanges`) are bypassed unless handled explicitly in the SQL expression.',
    spokenTip: 'ExecuteUpdateAsync and ExecuteDeleteAsync run direct SQL updates on the database without loading entities into memory or using the ChangeTracker.',
    example: {
      language: 'csharp',
      code: `// ✅ Modern EF Core 7/8+: Direct bulk update on database server
var cutoffDate = DateTime.UtcNow.AddMonths(-6);

int affectedRows = await _db.Accounts
    .Where(a => a.LastActivityAt < cutoffDate && a.IsActive)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(a => a.IsActive, false)
        .SetProperty(a => a.DeactivatedAt, DateTime.UtcNow)
    );

// Bulk Delete: Single SQL DELETE statement
await _db.TempUploads
    .Where(t => t.ExpiresAt < DateTime.UtcNow)
    .ExecuteDeleteAsync();`,
      explanation: 'Uses ExecuteUpdateAsync and ExecuteDeleteAsync for high-performance direct SQL execution.'
    },
    seniorPoint: 'If you have loaded entities currently tracked in `DbContext.ChangeTracker` that match the updated rows, their in-memory values will become stale after calling `ExecuteUpdateAsync`. Call `_db.ChangeTracker.Clear()` to avoid inconsistencies.',
    followUps: [
      {
        question: 'Can you use navigation properties and subqueries inside `ExecuteUpdateAsync`?',
        answer: 'Yes! EF Core translates complex LINQ expressions, navigation joins, and mathematical calculations (e.g. `SetProperty(p => p.Price, p => p.Price * 1.1m)`) into valid SQL expressions.'
      },
      {
        question: 'Why do `ExecuteUpdateAsync` and `ExecuteDeleteAsync` bypass EF Core concurrency tokens (`RowVersion`)?',
        answer: 'Because they operate as direct bulk SQL commands across sets of rows rather than inspecting individual entity snapshots in the change tracker.'
      }
    ],
    keyPointsToMention: [
      'Direct SQL translation on DB server without materializing entities into memory',
      'Bypasses EF Core Change Tracker (O(1) memory and single round-trip execution)',
      'ChangeTracker in-memory entities become stale (call ChangeTracker.Clear())',
      'Bypasses SaveChanges interceptors and entity lifecycle events'
    ],
    tags: ['EF Core', 'Bulk Operations', 'ExecuteUpdate', 'ExecuteDelete', 'Performance', 'SQL']
  },
  {
    id: 'efcore-database-migrations-cicd',
    category: 'efcore',
    topic: 'Database Migrations & CI/CD Pipelines',
    difficulty: 'Senior',
    question: 'How do you architect EF Core Database Migrations for zero-downtime CI/CD production deployments? Why is context.Database.Migrate() at startup dangerous?',
    shortAnswer: 'Running `context.Database.Migrate()` on application startup in production is dangerous because multiple container instances booting concurrently will race and deadlock on the `__EFMigrationsHistory` table, and a failed migration can crash all web pods. Instead, generate idempotent SQL scripts (`dotnet ef migrations script --idempotent`) and execute them in your CI/CD deployment pipeline or via a dedicated Kubernetes init-container/migration job.',
    interviewAnswer: 'In enterprise production deployments, managing database migrations safely requires strict separation of concerns:\n\n1. **The Startup Migration Anti-Pattern (`context.Database.Migrate()`)**:\n   - *Race Conditions*: In a Kubernetes cluster with 5 replica pods starting at once, all 5 attempt to run migrations simultaneously, causing transaction lock contention, corrupted migration history, and app crashes.\n   - *Permissions Violation*: Web API applications should connect to the database with least-privilege users (DML: `SELECT`, `INSERT`, `UPDATE`, `DELETE`), NOT schema-modifying admin rights (DDL: `CREATE TABLE`, `ALTER TABLE`).\n2. **Production Best Practice: CI/CD Migration Scripts / Migration Bundles**:\n   - Generate an idempotent SQL script in the build pipeline: `dotnet ef migrations script --idempotent --output migration.sql`.\n   - Or build an executable **EF Core Migration Bundle**: `dotnet ef migrations bundle`.\n   - Run the migration bundle once inside the CI/CD pipeline (or a dedicated single-instance Kubernetes Job) using an elevated DB administrator connection before new application pods are deployed.\n3. **Zero-Downtime Expand/Contract Pattern**:\n   - Never rename or drop columns in a single release. Step 1 (Expand): Add new nullable column. Step 2: Deploy new app version writing to both. Step 3 (Contract): Backfill data and drop old column in a later release.',
    spokenTip: 'Never run migrations inside app startup in production. Generate idempotent SQL scripts or Migration Bundles and run them in your CI/CD pipeline before deploying pods.',
    example: {
      language: 'bash',
      code: `# 1. Generate self-contained Migration Executable Bundle in CI/CD pipeline
dotnet ef migrations bundle --output ./bundle/migrate --self-contained -r linux-x64

# 2. In CI/CD Deploy Stage (GitHub Actions / GitLab CI):
# Run migration bundle once using admin connection string
./bundle/migrate --connection "$DATABASE_ADMIN_CONNECTION_STRING"

# 3. Deploy Kubernetes pods with least-privilege runtime connection strings`,
      explanation: 'Builds and executes an EF Core Migration Bundle in a CI/CD deployment stage.'
    },
    seniorPoint: 'Always follow the **Expand/Contract Pattern** (Parallel Change) for zero-downtime deployments. Old application pods and new application pods run concurrently during rolling updates; schema changes must remain backward-compatible with the old application version.',
    followUps: [
      {
        question: 'What is an Idempotent migration script (`--idempotent`)?',
        answer: 'A SQL script containing `IF NOT EXISTS` checks against the `__EFMigrationsHistory` table for every migration block, ensuring the script can be run multiple times safely without applying duplicate changes.'
      },
      {
        question: 'How do you handle data seeding for lookups (like Country or Role tables) in EF Core?',
        answer: 'Use `HasData()` in `OnModelCreating` for static lookup metadata (which generates migration `INSERT` statements) or run a dedicated idempotent data seeder in CI/CD.'
      }
    ],
    keyPointsToMention: [
      'Danger of context.Database.Migrate() at startup: race conditions across multi-pod replicas and permission violations',
      'Least-privilege runtime DB users (DML only) vs DDL migration users',
      'EF Core Migration Bundles (dotnet ef migrations bundle) for CI/CD',
      'Idempotent SQL script generation (--idempotent)',
      'Expand/Contract (Parallel Change) pattern for zero-downtime database upgrades'
    ],
    tags: ['EF Core', 'Migrations', 'CI/CD', 'DevOps', 'Zero-Downtime', 'Kubernetes', 'Architecture']
  }
];
