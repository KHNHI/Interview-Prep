export type InterviewStep = {
  id: string; title: string; minutes: number; goal: string; output: string;
  questions: string[]; say: string; mistake: string;
};

export const INTERVIEW_STEPS: InterviewStep[] = [
  { id: "clarify", title: "Clarify", minutes: 5,
    goal: "Agree on what to build before choosing technologies. Separate features from quality goals such as latency, availability and consistency.",
    output: "A short list of core features, quality goals and explicit exclusions.",
    questions: ["Who uses the system, and what are the two most important actions?", "What scale and response time should we plan for?", "Which features can we leave out of this discussion?"],
    say: "Before I draw the architecture, I would like to confirm the core use cases and the scale we should design for.",
    mistake: "Starting with Redis, Kafka or microservices before knowing the problem. A technology is a choice to justify, not a requirement." },
  { id: "estimate", title: "Estimate", minutes: 5,
    goal: "Use round numbers to learn what drives the design. Estimate average requests per second, a separate peak assumption, and storage.",
    output: "Labelled assumptions, a few calculations, and their architectural consequences.",
    questions: ["How many operations happen each day, and what is the read-to-write ratio?", "Should we assume a particular peak-to-average traffic ratio?", "How long is data retained, and how large is each record?"],
    say: "I will use these as planning assumptions. The average is daily requests divided by 86,400; I will estimate peak traffic separately.",
    mistake: "Treating daily active users as requests per second, presenting guesses as measured facts, or doing calculations without explaining what they change." },
  { id: "api-data", title: "APIs & Data", minutes: 5,
    goal: "Define the contract and the smallest useful data model. Show a successful request, a response, and important error cases.",
    output: "Core endpoints, request/response examples, keys, indexes and constraints.",
    questions: ["What must the client send, and what should it receive?", "Which lookup must be fast?", "What uniqueness, expiry or authorization rules must the data enforce?"],
    say: "Let me make the contract concrete first. Then I can choose a data model that supports these access patterns.",
    mistake: "Listing endpoint names without examples, or choosing SQL versus NoSQL before identifying reads, writes and correctness constraints." },
  { id: "high-level", title: "High-Level Design", minutes: 12,
    goal: "Draw the simplest working system and follow a request from the client to storage and back. Explain read and write paths separately.",
    output: "A labelled diagram, request walkthroughs, and a clear durable source of truth.",
    questions: ["Where does each request enter and which service handles it?", "What happens on a cache hit and a cache miss?", "Which parts are synchronous, and which can happen later?"],
    say: "I will walk through one write and one read. I will start with a simple baseline and add complexity only where the requirements need it.",
    mistake: "Drawing many boxes without explaining their responsibilities, forgetting the response path, or adding a queue when no asynchronous work is needed." },
  { id: "deep-dives", title: "Deep Dives", minutes: 13,
    goal: "Choose one or two important design problems. Compare alternatives using the requirements, rather than discussing every component equally.",
    output: "A concrete mechanism, an alternative, a reason for the choice, and its cost.",
    questions: ["Which part is hardest to make correct at this scale?", "What alternative would be simpler, and why might we reject it?", "What changes when multiple requests run at the same time?"],
    say: "The two decisions I would examine more closely are these. I will explain how each works, its failure cases, and the trade-off I am accepting.",
    mistake: "Saying 'use caching' or 'shard the database' without explaining keys, invalidation, concurrency, or the cost of the added complexity." },
  { id: "bottlenecks", title: "Bottlenecks & Wrap-up", minutes: 5,
    goal: "Check overload and failure behavior, then summarize how the design meets the agreed scope. Name the limitations honestly.",
    output: "Failure responses, useful monitoring signals, trade-offs, and a short final summary.",
    questions: ["What happens if the cache, database or provider becomes unavailable?", "Which component saturates first, and how would we notice?", "What would we change first if traffic grew ten times?"],
    say: "The main risk is this bottleneck. I would monitor these signals, handle failures this way, and expand the design only when measurements justify it.",
    mistake: "Promising zero downtime or unlimited scale, treating replication as a backup, or ending without revisiting the original requirements." },
];

export const URL_SHORTENER_LESSON = [
  {
    example: `## Agree on the scope
We are designing a public URL shortener. A user submits a long URL, receives a short link, and another user follows it to the destination.

## Questions and assumed answers
| Ask the interviewer | Assume for this example |
|---|---|
| Do we need custom aliases? | No; the service generates a code. |
| Do links expire or change? | Expiry is optional; destination URLs are immutable. |
| Do we need accounts or analytics? | Accounts and detailed analytics are out of scope. |
| What traffic should we support? | 1 million new links and 100 million redirects per day. |
| Which path matters most? | Redirects should be highly available and fast. |

## Quality goals
- Aim for redirect-service p95 latency below 100 ms in the primary region, excluding the destination website. This is a proposed target to validate, not a measured result.
- A successfully created link must be durably stored before we acknowledge it.
- Cache entries may be eventually consistent, but expired links must not remain usable past the chosen expiry policy.

## Keep out of scope
Custom aliases, editing destinations, global active-active writes and a complete abuse-detection platform. Basic URL validation and request limits still belong in the baseline.`,
    say: "I will focus on creating short links and redirecting users. I am assuming immutable destinations, optional expiry, and much more read traffic than write traffic. Is that a reasonable scope?",
    mistakes: ["Quietly assuming custom aliases or editable links: both change collision and cache behavior.", "Saying availability matters without specifying how creation and redirects should behave during failures."],
  },
  {
    example: `## Start with explicit assumptions
These are interview planning numbers, not traffic measured from this project. Use a 365-day year, decimal GB/TB, 500 bytes per stored mapping, and a separate 10× peak assumption.

| Quantity | Calculation | Approximate result |
|---|---|---|
| Average creates | 1,000,000 ÷ 86,400 | 12 requests/second |
| Average redirects | 100,000,000 ÷ 86,400 | 1,160 requests/second |
| Peak creates | 12 × 10 | 120 requests/second |
| Peak redirects | 1,160 × 10 | 11,600 requests/second |
| Read-to-write ratio | 100 million ÷ 1 million | 100:1 |
| Mappings after one year | 1 million × 365 | 365 million |
| Raw annual storage | 365 million × 500 bytes | 182.5 GB |
| Raw five-year storage | 182.5 GB × 5 | About 0.91 TB |

## What these numbers change
- Redirects dominate. Keep application instances stateless so we can add read capacity behind the gateway/load balancer.
- A cache is useful for repeatedly accessed links. It will not help equally for every traffic distribution; measure the hit rate.
- Raw storage excludes indexes, database overhead, replicas and backups. Provision those separately instead of calling 0.91 TB the total bill.
- If a cached entry averages 500 bytes and we cache 1 million hot links, raw cache data is about 0.5 GB. Redis overhead and replicas need additional memory.
- A 90% hit rate at the assumed peak still leaves about 1,160 database lookups/second. If Redis fails, demand could rise to 11,600/second. Those are capacity scenarios to load-test.

Do not shard just because the total count sounds large. Start with an indexed database and measure throughput and operational limits.`,
    say: "The workload is roughly 100 reads for each write. At a ten-times peak, redirects reach about twelve thousand requests per second. That makes cache hit rate and database protection more important than optimizing the small write workload first.",
    mistakes: ["Confusing average QPS with peak QPS, or assuming the peak multiplier was given as a fact.", "Counting only row data and forgetting indexes, replication and backups.", "Assuming a high cache hit rate removes the need to size the database for misses and failures."],
  },
  {
    example: `## Create a link

\`\`\`http
POST /api/shorten
Content-Type: application/json

{"longUrl":"https://example.com/articles/system-design"}

201 Created
{"shortUrl":"https://sho.rt/aB3kP9z","code":"aB3kP9z"}
\`\`\`

The domain above is illustrative. Accept only supported URL schemes such as HTTP/HTTPS and enforce a URL-length limit. An optional expiry must be a valid future timestamp.

## Follow a link

\`\`\`http
GET /aB3kP9z

302 Found
Location: https://example.com/articles/system-design
Cache-Control: no-store
\`\`\`

Use 302 with an explicit no-store policy in this baseline so a browser-cached permanent redirect does not bypass a future expiry check. A 301 is a different choice when permanent client caching is acceptable.

## Important responses
- **400**: invalid URL or expiry.
- **404**: unknown or expired code; avoid leaking whether an expired mapping once existed.
- **429**: creation rate limit exceeded.
- **503**: temporarily unable to safely serve the request.

## Mapping table
| Field | Role |
|---|---|
| short_code | Unique indexed key; used for every redirect lookup. |
| long_url | Original destination, immutable in this design. |
| created_at | Creation timestamp. |
| expires_at | Nullable expiry timestamp. |

A relational database is a reasonable starting point because indexed lookups and a unique constraint fit the workload. No joins are required on the redirect path. A key-value database is an alternative if later scale or operations justify it.`,
    say: "There are two endpoints: one creates a mapping, and one returns a redirect. The short code is the lookup key and must be unique. I would use a 302 with an explicit cache policy so expiry is checked by our service.",
    mistakes: ["Returning a destination in JSON instead of an HTTP redirect without explaining the changed client contract.", "Choosing 301 while also promising that link expiry will always be checked on subsequent visits.", "Treating an internal code collision as the client's invalid input; generated-code collisions should be retried internally."],
  },
  {
    example: `## Begin with a working baseline
Without a cache, a stateless API plus a durable indexed mapping store can serve both use cases. Add Redis to protect the store and speed up popular redirects as traffic grows. The read/write boxes describe responsibilities; they do not have to be separate deployable microservices.

## Write path
1. The gateway routes a creation request to the write handler.
2. Validate the destination and expiry, then generate a candidate code.
3. Insert the mapping with a unique constraint. Retry a generated-code collision with a fresh code, up to a bounded limit.
4. Return the short URL only after the database confirms a durable write.

## Read path
1. The gateway routes the short code to the read handler.
2. Check Redis for the destination and expiry.
3. On a miss, query the database by its indexed short code.
4. Reject unknown/expired mappings. Otherwise populate the cache and return the redirect to the browser.
5. The browser follows the Location header to the destination website. Our service does not fetch that website as part of the redirect.

## Source of truth
The database owns the mapping. Redis is a replaceable cache, not the only copy. The diagram omits response arrows to keep it readable; the redirect response returns through the API path to the client.

An ID generator is one code-generation responsibility. For the random-code choice in the next step it can simply be a library inside the write handler; it does not require a separate network service.`,
    say: "For creation, I persist the mapping before returning success. For a redirect, I check Redis, fall back to the database on a miss, then send the destination in a redirect response. The browser makes the final request to the destination.",
    mistakes: ["Assuming each box needs its own microservice and deployment.", "Describing only the cache-hit path and forgetting misses, expiry and the response.", "Returning success before the mapping is durably stored."],
  },
  {
    example: `## Decision 1: generate short codes safely
One option is a unique increasing ID encoded in Base62. It avoids random collisions but requires coordinated ID allocation and makes nearby links easy to enumerate.

For this example, choose seven random Base62 characters from a cryptographically secure random source. The namespace is 62^7, about 3.5 trillion possible codes. This is a namespace size, not a guarantee of zero collisions or an authorization mechanism.

Use a unique database constraint and an insert-and-retry loop. A preliminary "does this code exist?" query alone is unsafe: two writers can both observe that the same code is free. Bound retries; if they are exhausted, fail the request and investigate. Monitor the collision rate and lengthen codes if needed.

## Decision 2: cache without breaking expiry
- Cache-aside: read Redis, then load from the database on a miss.
- Store the expiry alongside the destination. For expiring links, set Redis TTL no longer than the remaining link lifetime, and check the expiry before redirecting.
- For non-expiring links, a bounded cache TTL still limits memory residency; the durable mapping stays in the database.
- Coalesce concurrent misses for the same hot key, and consider TTL jitter that never extends beyond link expiry. This reduces a cache stampede, where many requests reload the same expired cache entry at once.
- Consider a small, short-lived negative cache for unknown codes, with a policy that does not hide newly created links.

## Trade-off to say out loud
Random codes avoid a central sequence allocator but need collision retries. Cache-aside is simple and fast for hot links, but cache failure moves load to the database. Immutable destinations simplify invalidation; supporting edits would require a new consistency policy.`,
    say: "I would choose random Base62 codes with a database uniqueness constraint and bounded retries. For caching, the important rule is that cache lifetime must never extend a link's expiry. I would also coalesce hot-key misses to protect the database.",
    mistakes: ["Calling a seven-character code collision-free or secure just because the namespace is large.", "Using check-then-insert as the only concurrency protection.", "Setting a fixed cache TTL longer than the remaining lifetime of an expiring link."],
  },
  {
    example: `## Failure and overload review
| Situation | Behavior and trade-off |
|---|---|
| Redis unavailable | Bypass with a short cache timeout, but cap database concurrency. Shed load with 503 rather than turning every miss into an unbounded database request. |
| Database unavailable | Creation fails with 503. Unexpired cached mappings may still redirect under the agreed policy; cache misses fail with 503. Never turn a database outage into a false 404. |
| One link becomes extremely popular | Monitor hot keys, coalesce misses and scale read capacity. A read replica helps only with a clear replication-lag policy. |
| An application instance fails | Route traffic to healthy stateless instances. Multiple instances and a redundant load-balancing layer are needed for redundancy. |
| Region failure or lost data | Define recovery time and acceptable data loss. Replication and tested backups serve different purposes; multi-region writes are a separate design decision. |

## What to monitor
- Redirect p95/p99 latency, request rate, and error rate, split by cache hit/miss.
- Cache hit rate, Redis errors, eviction rate and memory use.
- Database latency, connection saturation, write failures and replica lag if replicas are added.
- Code-collision retries, rejected creation requests and expiry-related failures.

## First changes at 10× traffic
Load-test the read path, add stateless API capacity, tune cache sizing and protect the database. Evaluate partitioning by short code only when measured storage/throughput limits justify its operational cost. Basic abuse handling matters for a public redirect service; a complete trust-and-safety system remains outside this interview's scope.

## Wrap up in 30 seconds
The design supports creation and fast redirects with durable mappings and cache-aside reads. It prioritizes redirects, makes expiry explicit, and handles collisions safely. Its main operational risk is cache loss overwhelming the database. Global writes, editable links and detailed analytics are deliberate exclusions.`,
    say: "This design meets the two core use cases and favors fast redirects. The main failure risk is a cache outage flooding the database, so I would bound fallback traffic and monitor saturation. I would validate the latency and capacity assumptions with load tests before claiming the targets are met.",
    mistakes: ["Claiming the latency target or peak capacity has been proven without a load test.", "Returning 404 when the database is unavailable.", "Adding sharding immediately instead of measuring the actual bottleneck."],
  },
];
