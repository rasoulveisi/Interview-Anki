import { Question } from '../types';

export const sqlQuestions: Question[] = [
  {
    id: 'sql-clustered-vs-nonclustered-indexes',
    category: 'sql',
    topic: 'Indexes & Query Performance',
    difficulty: 'Intermediate',
    question: 'What is the difference between a Clustered and a Non-Clustered Index in SQL, and what are index trade-offs?',
    shortAnswer: 'A Clustered Index defines the physical sorting and storage order of table data rows on disk (only one per table, usually Primary Key). A Non-Clustered Index is a separate B-tree structure holding indexed column keys and pointers (Row IDs or Clustered Key) back to the actual data row.',
    interviewAnswer: 'The way I think about it is like a phone book versus the index at the back of a textbook. A Clustered Index is the phone book: the data rows themselves are physically stored in alphabetical order. Because data can only be physically sorted one way, a table can have only one clustered index (typically on the Primary Key). A Non-Clustered Index is like the index at the back of a book: it lists keywords and page numbers. When the database looks up a value, it traverses the B-tree of the non-clustered index, finds the row pointer, and does a "Key Lookup" to fetch the actual table row. The trade-off is write performance: while indexes make `SELECT` queries fast, every `INSERT`, `UPDATE`, and `DELETE` must update every single index on that table, increasing I/O and transaction log size.',
    spokenTip: 'Clustered index dictates the physical storage order of the data on disk (one per table); non-clustered index is a separate lookup structure with pointers.',
    example: {
      language: 'sql',
      code: `-- Clustered Index created automatically with Primary Key
CREATE TABLE Users (
    Id INT PRIMARY KEY, -- Clustered Index
    Email VARCHAR(255) NOT NULL,
    CreatedAt DATETIME NOT NULL
);

-- Non-Clustered Index for fast email searches
CREATE NONCLUSTERED INDEX IX_Users_Email 
ON Users (Email);

-- Covering Index (Includes additional columns to avoid key lookups!)
CREATE NONCLUSTERED INDEX IX_Users_CreatedAt_Covering
ON Users (CreatedAt)
INCLUDE (Email, Id);`,
      explanation: 'Creating clustered, non-clustered, and covering indexes in SQL.'
    },
    seniorPoint: 'A **Covering Index** includes all columns requested by the `SELECT` query (using the `INCLUDE` clause). This allows the database engine to satisfy the entire query directly from the non-clustered index pages without performing an expensive "Key Lookup" against the clustered table storage.',
    followUps: [
      {
        question: 'What is the difference between an Index Seek and an Index Scan?',
        answer: 'An Index Seek traverses the B-Tree directly to the exact target rows in O(log N) time. An Index Scan reads through the entire index leaf level in O(N) time (often because an unindexed function was used in the WHERE clause).'
      },
      {
        question: 'Why should you avoid indexing columns with very low cardinality (like boolean IsActive)?',
        answer: 'Because the query optimizer will determine that scanning the index is not selective enough and will fall back to a full table scan anyway, while still penalizing write performance.'
      }
    ],
    keyPointsToMention: [
      'Clustered Index: physical data order on disk (1 per table)',
      'Non-Clustered Index: separate B-tree structure pointing to rows (multiple per table)',
      'Covering Index: uses INCLUDE to eliminate Key Lookups',
      'Index Seek (O(log N) fast) vs Index Scan (O(N) full scan)',
      'Trade-offs: Read speed vs write performance overhead on INSERT/UPDATE'
    ],
    tags: ['SQL', 'Indexes', 'Performance', 'Database', 'Optimization']
  },
  {
    id: 'sql-acid-and-isolation-levels',
    category: 'sql',
    topic: 'Transactions & ACID',
    difficulty: 'Strong Mid',
    question: 'What are ACID properties and what are the 4 SQL Transaction Isolation Levels and their read phenomena?',
    shortAnswer: 'ACID stands for Atomicity (all or nothing), Consistency (preserves constraints), Isolation (concurrent transactions don\'t interfere), and Durability (committed changes survive crashes). The 4 isolation levels are Read Uncommitted, Read Committed, Repeatable Read, and Serializable.',
    interviewAnswer: 'ACID guarantees database reliability. Atomicity means a transaction is all-or-nothing. Consistency means database rules and foreign keys are never violated. Isolation controls concurrency, and Durability means committed transactions are written to write-ahead logs on disk. Isolation levels control trade-offs between concurrency and anomalies: 1) **Read Uncommitted**: fastest, but allows **Dirty Reads** (reading uncommitted changes that might be rolled back). 2) **Read Committed**: default in most DBs, prevents dirty reads but allows **Non-Repeatable Reads** (re-reading a row gets updated values if another transaction committed). 3) **Repeatable Read**: holds shared read locks until end of transaction, preventing non-repeatable reads, but allows **Phantom Reads** (new rows inserted matching the WHERE range). 4) **Serializable**: strictest, places range locks preventing all anomalies, but severely limits concurrency.',
    spokenTip: 'The four isolation levels balance concurrency versus anomalies: from Read Uncommitted (dirty reads) to Serializable (full range locking).',
    example: {
      language: 'text',
      code: `Isolation Level   | Dirty Read | Non-Repeatable Read | Phantom Read
------------------|------------|---------------------|-------------
Read Uncommitted  | Allowed    | Allowed             | Allowed
Read Committed    | Prevented  | Allowed             | Allowed
Repeatable Read   | Prevented  | Prevented           | Allowed
Serializable      | Prevented  | Prevented           | Prevented

*Snapshot Isolation (MVCC in PostgreSQL / SQL Server) provides repeatable reads without read locks using row versioning.`,
      explanation: 'Clear matrix of isolation levels and read anomalies.'
    },
    seniorPoint: 'Modern databases like PostgreSQL and SQL Server (with RCSI - Read Committed Snapshot Isolation) use Multi-Version Concurrency Control (MVCC). Instead of locking rows on reads, readers read old versions from tempdb/undo log, so "Readers do not block Writers, and Writers do not block Readers".',
    followUps: [
      {
        question: 'What is a Dirty Read?',
        answer: 'When Transaction A reads data modified by Transaction B before Transaction B commits. If Transaction B rolls back, Transaction A acted on invalid data.'
      }
    ],
    keyPointsToMention: [
      'ACID: Atomicity, Consistency, Isolation, Durability',
      'Read Uncommitted (dirty reads allowed)',
      'Read Committed (default, prevents dirty reads)',
      'Repeatable Read (prevents non-repeatable reads)',
      'Serializable (prevents phantom reads via range locks)',
      'MVCC: Snapshot isolation eliminates read/write lock contention'
    ],
    tags: ['SQL', 'ACID', 'Transactions', 'Concurrency', 'Database']
  },
  {
    id: 'sql-joins-and-aggregations',
    category: 'sql',
    topic: 'JOINs, GROUP BY & Window Functions',
    difficulty: 'Intermediate',
    question: 'How do INNER, LEFT, RIGHT, and FULL OUTER JOINs differ, and what is the difference between WHERE and HAVING?',
    shortAnswer: 'INNER JOIN returns matching rows from both tables. LEFT JOIN returns all rows from the left table plus matches from the right (nulls if no match). RIGHT JOIN is the opposite. FULL OUTER returns all rows from both tables. WHERE filters rows BEFORE aggregation; HAVING filters groups AFTER aggregation.',
    interviewAnswer: 'In SQL, JOINs combine records from two tables based on a related column. INNER JOIN only produces rows where there is a match in both tables. LEFT JOIN preserves all rows from the left table, filling right-side columns with NULL if no match exists. For filtering and aggregations: `WHERE` filters individual rows before any `GROUP BY` calculation happens. `HAVING` filters the aggregated result sets after grouping. For example, `WHERE Price > 100` filters products before grouping, while `GROUP BY CategoryId HAVING COUNT(*) > 5` filters categories after counting.',
    spokenTip: 'WHERE filters rows before grouping; HAVING filters groups after aggregation.',
    example: {
      language: 'sql',
      code: `-- Filtering before (WHERE) and after (HAVING) grouping
SELECT 
    DepartmentId, 
    COUNT(*) AS EmployeeCount, 
    AVG(Salary) AS AverageSalary
FROM Employees
WHERE IsActive = 1                   -- Filters individual rows FIRST
GROUP BY DepartmentId
HAVING AVG(Salary) > 75000;          -- Filters calculated aggregate groups AFTER

-- Window Function: ROW_NUMBER partitioned by department
SELECT 
    Name, 
    DepartmentId, 
    Salary,
    ROW_NUMBER() OVER (PARTITION BY DepartmentId ORDER BY Salary DESC) as RankInDept
FROM Employees;`,
      explanation: 'Showing WHERE vs HAVING, and ROW_NUMBER() window function.'
    },
    seniorPoint: 'Window functions (like `ROW_NUMBER()`, `RANK()`, `LEAD()`, `LAG()`) perform calculations across a set of rows related to the current row without collapsing the rows into a single summary like `GROUP BY` does.',
    followUps: [
      {
        question: 'What is a Common Table Expression (CTE)?',
        answer: 'A temporary named result set defined using `WITH Name AS (...)` that exists only during query execution, making complex queries readable and supporting recursive queries.'
      }
    ],
    keyPointsToMention: [
      'INNER (only matches), LEFT (all left + matches), FULL OUTER (all both)',
      'WHERE filters raw rows prior to aggregation',
      'HAVING filters aggregated groups (COUNT, SUM, AVG)',
      'Window functions (OVER PARTITION BY) calculate without collapsing row count',
      'CTEs (WITH syntax) improve query readability and modularity'
    ],
    tags: ['SQL', 'JOINs', 'Aggregations', 'Window Functions', 'Queries']
  },
  {
    id: 'sql-troubleshoot-slow-query-1m-rows',
    category: 'sql',
    topic: 'Performance Troubleshooting',
    difficulty: 'Strong Mid',
    question: 'Scenario: An API query runs instantly with 1,000 rows, but takes 8 seconds with 1,000,000 rows. How would you investigate and fix it?',
    shortAnswer: 'I would inspect the SQL Execution Plan (looking for Table Scans or expensive Key Lookups), check for missing or non-sargable indexes, review pagination logic, verify server statistics, and optimize EF Core LINQ projections.',
    interviewAnswer: 'When a query slows down as data scales, it almost always means the database went from fast index seeks to full table scans. Here is my systematic troubleshooting process: First, I capture the exact generated SQL query using EF Core logging or SQL Profiler/Extended Events. Second, I run the query with `EXPLAIN ANALYZE` (Postgres) or `SET STATISTICS IO, TIME ON` and view the Graphical Execution Plan in SSMS. I check for **Table Scans** (missing index on filtered/joined columns), **Implicit Type Conversions** (e.g. comparing string to nvarchar), or **Non-Sargable WHERE clauses** (like `WHERE YEAR(CreatedAt) = 2026`, which prevents index seeks). Third, I check if `SELECT *` is fetching unnecessary large text/blob columns instead of projecting only needed columns. Fourth, if paginating with `OFFSET 500000`, I switch to keyset/cursor pagination.',
    spokenTip: 'The first thing I would do is generate the SQL Execution Plan to see if the database engine is doing an Index Seek or a full Table Scan.',
    example: {
      language: 'sql',
      code: `-- NON-SARGABLE (Bad: function on column forces Table Scan on 1M rows)
SELECT Id, Name FROM Orders 
WHERE DATEPART(year, OrderDate) = 2026;

-- SARGABLE (Good: uses index on OrderDate via range seek)
SELECT Id, Name FROM Orders 
WHERE OrderDate >= '2026-01-01' AND OrderDate < '2027-01-01';`,
      explanation: 'Wrapping columns in functions ruins index usage (Non-Sargable). Range queries keep them Sargable.'
    },
    seniorPoint: 'A "Sargable" (Search Argument Able) query allows the database engine to use an index seek. Wrapping indexed columns in functions like `LOWER(Email)` or `SUBSTRING()` prevents index usage. In PostgreSQL, you create an expression index (`CREATE INDEX ON Users (LOWER(Email))`), or in SQL Server you keep the query Sargable.',
    followUps: [
      {
        question: 'What are database Statistics, and why do they cause sudden query slowdowns?',
        answer: 'Statistics are statistical distributions of column values used by the Query Optimizer to choose the best execution plan. Outdated statistics cause the optimizer to choose a slow nested-loop join or table scan instead of an index seek.'
      }
    ],
    keyPointsToMention: [
      'Generate and inspect Execution Plan (Table Scan vs Index Seek)',
      'Look for missing indexes on JOIN/WHERE/ORDER BY columns',
      'Identify Non-Sargable predicates (functions on indexed columns)',
      'Avoid SELECT * (fetch only needed columns via covering indexes)',
      'Check for deep OFFSET pagination and replace with Cursor pagination',
      'Update stale database statistics'
    ],
    tags: ['Troubleshooting', 'SQL', 'Performance', 'Indexes', 'Scenarios']
  },
  {
    id: 'sql-deadlocks-and-prevention',
    category: 'sql',
    topic: 'Concurrency & Deadlocks',
    difficulty: 'Strong Mid',
    question: 'What causes SQL Deadlocks, how does the database handle them, and how do you prevent them in code?',
    shortAnswer: 'A deadlock occurs when two concurrent transactions hold locks on resources the other needs, creating a circular dependency. The database resolves it by choosing one transaction as the deadlock victim and rolling it back.',
    interviewAnswer: 'A classic deadlock happens like this: Transaction 1 locks Row A and requests a lock on Row B. At the exact same moment, Transaction 2 locks Row B and requests a lock on Row A. Neither can proceed. The database\'s deadlock monitor detects this circular wait graph, terminates the transaction with the lowest cost to roll back (the "victim"), and returns an error (like SQL Error 1205) to ASP.NET Core. In application code, we prevent deadlocks by: 1) **Accessing tables and rows in the exact same consistent order** across all service methods (e.g. always update Customers before Orders), 2) **Keeping transactions as short as possible** (never do HTTP API calls or heavy computations inside a database transaction), 3) **Using lower isolation levels or Read Committed Snapshot Isolation (RCSI)** so readers don\'t lock out writers, and 4) **Adding retry policies** using Polly in C#.',
    spokenTip: 'Deadlocks happen when two transactions wait on each other in a circle. The best prevention is always updating tables in the exact same consistent order.',
    example: {
      language: 'csharp',
      code: `// Polly Retry policy for transient SQL Deadlocks in C#
var retryPolicy = Policy
    .Handle<SqlException>(ex => ex.Number == 1205) // Deadlock error code
    .WaitAndRetryAsync(3, retryAttempt => 
        TimeSpan.FromMilliseconds(50 * Math.Pow(2, retryAttempt)) // Exponential backoff
    );

await retryPolicy.ExecuteAsync(async () => {
    using var tx = await _db.Database.BeginTransactionAsync();
    // Perform database operations in consistent entity order
    await _db.SaveChangesAsync();
    await tx.CommitAsync();
});`,
      explanation: 'Handling deadlock exceptions with Polly exponential backoff retries.'
    },
    seniorPoint: 'A common frontend-backend deadlock trap: long-running background batch jobs updating rows without indexed foreign keys. Missing indexes on foreign keys cause SQL Server to escalate locks to table-level locks during cascade deletes, deadlocking with normal web API requests.',
    followUps: [
      {
        question: 'Why should you never make external HTTP API calls inside a database transaction?',
        answer: 'Because an external HTTP call takes 100ms-5000ms. Holding open database row locks for seconds exhausts connection pools and causes massive lock queues and deadlocks across the entire system.'
      }
    ],
    keyPointsToMention: [
      'Circular lock dependency between concurrent transactions',
      'Database engine kills one transaction as the deadlock victim',
      'Prevention: Access objects in identical sequence across all queries',
      'Keep transactions minimal and fast (no external I/O inside transactions)',
      'Use Snapshot Isolation / RCSI to prevent reader-writer lock contention',
      'Use retry policies (Polly) with jitter for transient deadlock recovery'
    ],
    tags: ['SQL', 'Deadlocks', 'Transactions', 'Concurrency', 'Reliability']
  }
];
