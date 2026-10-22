export type LessonSection = { example: string; say: string; mistakes: string[]; questions?: string[] };

export const RATE_LIMITER_LESSON: LessonSection[] = [
  {
    questions: ["Is the limit per authenticated account, API key, IP, or route?", "Should short bursts be allowed?", "If Redis fails, which endpoints must remain protected?"],
    example: `## Agree on the policy
Build a shared rate limiter in front of an HTTP API. Count requests per authenticated account and route class. Unauthenticated traffic uses a separate IP-based policy; an IP is not a reliable person identifier. In a token bucket, each request spends one token; tokens refill over time up to a maximum capacity.

| Clarifying question | Assumption for this example |
|---|---|
| What is limited? | Requests, not successful business transactions. |
| What is the budget? | Refill 10 tokens/second; bucket capacity 20 tokens. |
| Are bursts allowed? | Yes: a full bucket permits up to 20 immediate requests. |
| Where does it run? | Multiple gateways in one region using shared Redis state. |
| How does rejection work? | Return 429 and a rounded-up Retry-After duration. |

## Quality goals
Propose less than 5 ms p95 added decision latency within the region, then validate it by measurement. Decisions for the same key should not independently spend the same tokens during normal operation.

Global multi-region quotas, a full billing ledger and protection against a large distributed denial-of-service attack are outside scope. A token bucket controls burst and sustained rate; it is not a strict rolling-window promise of at most 600 requests in every minute.

## Distinguish two kinds of protection
A caller's quota protects fairness. A separate concurrency or overload limit protects total backend capacity. Many callers staying within their quotas can still overload a service.`,
    say: "I will use a per-account token bucket shared across our gateways. It refills at ten requests per second and allows a burst of twenty. I would separate that fairness policy from a global overload limit.",
    mistakes: ["Saying 600 requests per minute when the chosen burst policy does not enforce a strict rolling-minute count.", "Assuming IP addresses uniquely identify users.", "Treating rate limiting as authentication or as complete DDoS protection."],
  },
  {
    questions: ["How many checks per second reach the limiter, including requests that are rejected?", "How many caller-route keys are active at once?", "What does an outage do to backend load?"],
    example: `## Planning assumptions
Assume 100 million incoming requests/day, a 10× peak, one million active caller-route keys, and 200 bytes of raw state per key. These are hypothetical numbers, not this application's traffic.

| Quantity | Calculation | Approximate result |
|---|---|---|
| Average checks | 100 million ÷ 86,400 | 1,160/second |
| Peak checks | 1,160 × 10 | 11,600/second |
| Raw state | 1 million × 200 bytes | 200 MB |
| Bucket refill time | capacity 20 ÷ rate 10 | 2 seconds |

## Design consequences
- Every incoming request needs a decision, including rejected requests. Size Redis for checks, not just allowed traffic.
- A single atomic script can perform a decision in one client round trip. Script work must be bounded and small; benchmark the actual deployment rather than assuming any Redis instance meets the target.
- Raw state excludes keys, allocator overhead, persistence and replicas. Expire idle state once recreating a full bucket is semantically safe; give the expiry a small safety margin.
- An average across keys hides a hot account that sends most traffic. Sharding helps distribute many keys, but one strictly consistent bucket still has an owner.
- If Redis fails and gateways all allow requests without checks, backend load can rise immediately. The outage policy is a capacity decision.`,
    say: "The limiter sees about twelve thousand checks per second at the assumed peak. Each check should be a short atomic Redis operation. The memory estimate is only raw state; I would measure overhead and hot-key behavior separately.",
    mistakes: ["Sizing the limiter only for requests that will be allowed.", "Calling a raw 200 MB estimate the actual Redis memory requirement.", "Ignoring hot-key skew because the average throughput looks manageable."],
  },
  {
    questions: ["What metadata does the gateway trust?", "How is Retry-After calculated?", "Where are policy versions and shared state stored?"],
    example: `## Public behavior
The client calls the normal API endpoint. It does not call a public 'am I allowed?' endpoint first: a separate check would race with the real request.

Example rejected response:

    HTTP/1.1 429 Too Many Requests
    Retry-After: 1
    Content-Type: application/json

    {"error":"rate_limit_exceeded","retryAfterSeconds":1}

## Internal decision contract
The gateway sends trusted account identity, route class, policy version and request cost (one token here) to the limiter. The decision returns allowed, remaining whole tokens and milliseconds until enough tokens exist for a rejected request. Round up when writing Retry-After in seconds.

Do not accept the account identity or request cost directly from an untrusted request header.

## State and policy
| Item | Contents |
|---|---|
| Policy configuration | Refill rate, capacity, route class, version and outage behavior. |
| Redis bucket | Remaining tokens and last refill timestamp. |
| Key | Region + account ID + route class + policy version. |

Bucket state is temporary operational data. Policy configuration should have a durable source and be cached locally. Define version changes carefully: blindly creating a new key gives every caller a fresh burst.

Rejected requests return 429. If enforcement is required but its state store cannot be reached, return 503 rather than claiming the caller exceeded a known quota.`,
    say: "Clients keep calling the normal API. Our gateway makes an internal atomic decision and either forwards the request or returns 429 with Retry-After. A limiter outage is different from a caller using up their budget.",
    mistakes: ["Making a public preflight check that does not reserve the token atomically.", "Trusting a client-controlled user ID header.", "Returning 429 for every infrastructure failure."],
  },
  {
    questions: ["Where does the request identity become trusted?", "Which operation reserves the token, and is it atomic?", "Does a downstream failure refund the request budget?"],
    example: `## Trace the allowed path
1. Authenticate the request and map it to a trusted identity and route policy.
2. The gateway invokes the limiter with that key and a cost of one token.
3. One bounded Redis script refills the bucket, checks the balance and deducts a token if allowed.
4. The limiter returns the decision. Only an allowed request reaches business logic.

## Trace rejection
The same decision finds fewer than one available token. It updates refill state without deducting an unavailable token, computes the wait duration, and returns a rejection. The gateway sends 429 to the client without invoking the backend.

## Responsibilities
The diagram's limiter can be a library in the gateway; it need not be another network hop. Redis provides shared per-key state so several gateway instances do not each give the same account an independent allowance.

Keep request processing synchronous through the decision. A queue would delay the answer without removing the need for an immediate allow/reject decision. A downstream failure does not refund the token in this request-counting policy.`,
    say: "Every gateway consults the same bucket before invoking the backend. The refill, check and deduction happen atomically. If the request is rejected, no business handler runs; a failed downstream request still counts under our agreed policy.",
    mistakes: ["Giving each gateway a full local quota while claiming the quota is global.", "Separating the counter read and write so concurrent requests overspend.", "Adding a queue to the synchronous admission decision without a reason."],
  },
  {
    questions: ["How do concurrent checks avoid overspending?", "Why choose token bucket over fixed windows?", "What guarantee remains after failover?"],
    example: `## Decision 1: token bucket versus time windows
A fixed window is simple but can allow bursts around a window boundary. A sliding log is more precise but stores more timestamps. A token bucket explicitly separates sustained rate from burst capacity, matching our scope.

For elapsed time dt and refill rate r:

    new_tokens = min(capacity, old_tokens + max(0, dt) * r)
    allowed = new_tokens >= request_cost
    if allowed: new_tokens -= request_cost

Use consistent units and fixed-point arithmetic if fractional tokens would introduce rounding problems. Use a consistent trusted time source for a bucket and guard against backward clock movement.

## Decision 2: atomic shared state
Perform read, refill, decision, write and expiry in one short Redis script. Redis executes scripts atomically, but a long script blocks other work; never scan many keys in the decision path.

For several limits that must be reserved together, check all before deducting any. In Redis Cluster, a multi-key atomic script needs keys in the same hash slot, so independent global/account limits may require a different partitioning or coordination design.

## Guarantees and costs
Shared state adds network latency and a dependency. Asynchronous replica failover can lose recent token deductions and temporarily admit extra requests. This is a best-effort traffic policy under failover, not a financial accounting guarantee.`,
    say: "A token bucket fits because we want a bounded burst and a sustained refill rate. The critical part is atomic refill and deduction. I would also state that failover can lose recent state, so this is not an exact billing ledger.",
    mistakes: ["Calling a fixed window equivalent to a rolling-window guarantee.", "Assuming Redis atomicity means state cannot be lost during failover.", "Running a cross-slot multi-key script without considering Redis Cluster constraints."],
  },
  {
    questions: ["Which routes fail open and which fail closed?", "How do we bound gateway time spent waiting for Redis?", "Which signals distinguish quota rejection from a limiter outage?"],
    example: `## Overload and failure review
| Situation | Response |
|---|---|
| Redis is slow | Use a short decision deadline and circuit breaker; do not exhaust every gateway connection waiting. |
| Sensitive endpoint loses limiter access | Fail closed with 503, or use a separately designed conservative local budget. |
| Low-risk read endpoint loses access | A documented fail-open policy may favor availability, with a separate backend overload guard. |
| A single bucket becomes hot | Keep work per decision small; local leases can reduce calls but require explicit coordination and overshoot bounds. |
| State resets after failover | Expect possible extra admissions; use stronger coordination if that is unacceptable. |

## Observe the decision, not just the backend
Track limiter p95/p99 latency, allow/reject/error counts by route policy, Redis saturation and errors, hot-key concentration, and backend concurrency. Avoid logging raw identities or unbounded high-cardinality metric labels.

## Wrap up
We have a shared per-account, per-route token bucket. It protects fairness before expensive work runs, supports explicit bursts, and separates quota rejection from infrastructure failure. Its main trade-off is enforcement consistency versus availability when Redis is unavailable. Multi-region strict quotas require a new coordination discussion.`,
    say: "The normal path has one shared atomic decision before business logic. The main trade-off is our outage policy: sensitive operations should stay protected, while low-risk reads may favor availability. I would validate decision latency and backend overload behavior under failure tests.",
    mistakes: ["Failing open on every endpoint without considering abuse and capacity.", "Failing closed everywhere while promising high availability.", "Using per-user IDs as unlimited metric labels or ignoring limiter latency."],
  },
];

export const NEWS_FEED_LESSON: LessonSection[] = [
  {
    questions: ["Is the feed chronological or ranked?", "Are follows, private accounts and deletion required?", "How quickly should a new post appear?"],
    example: `## Define a smaller product than all of Twitter
Build public text posts, follow relationships and a reverse-chronological home feed. Users must be authenticated to publish or read their own feed. Recommendations, media processing, search and ads are out of scope.

| Clarifying question | Assumed answer |
|---|---|
| How is the feed ordered? | Newest first, with an ID tie-breaker. |
| How fresh is it? | A few seconds of propagation delay is acceptable for ordinary feed delivery. |
| What scale? | 10 million daily active users, 2 posts and 20 feed-page reads per user/day. |
| What is a page? | Up to 20 posts. |
| What about deletion or blocked users? | Enforce current visibility when hydrating posts; cached IDs do not grant access. |

Propose a feed-read p95 target below 200 ms for the service in one region. This is a target to test, not a proven result. A successful publish means the post is durable; it does not mean every follower already sees it.

Read-your-own-post behavior should be explicit. For this example, merge the author's recent posts into their own home-feed result while asynchronous fan-out catches up.`,
    say: "I will design a chronological feed rather than recommendations. Publishing must be durable, but follower timelines may be a few seconds behind. Visibility checks still happen when we load posts from cached IDs.",
    mistakes: ["Designing recommendations without agreeing that ranking is required.", "Promising every follower sees a post as soon as publish returns.", "Assuming a cached post ID bypasses deletion or visibility checks."],
  },
  {
    questions: ["How often does each active user publish and read a feed page?", "How skewed are follower counts, and how large is a page?", "How many timeline writes and post hydration items does each request create?"],
    example: `## Planning assumptions
Use 10 million daily active users, 2 posts and 20 page reads each per day, 20 posts/page, a 10× peak, 500 followers per author on average, and 1 KB raw text/metadata per post. Real follower counts are highly skewed.

| Quantity | Calculation | Approximate result |
|---|---|---|
| Posts/day | 10 million × 2 | 20 million |
| Average publish rate | 20 million ÷ 86,400 | 232/second |
| Average feed reads | 200 million ÷ 86,400 | 2,315/second |
| Peak feed reads | 2,315 × 10 | 23,150/second |
| Raw post storage/day | 20 million × 1 KB | 20 GB |
| Raw post storage/year | 20 GB × 365 | 7.3 TB |
| Full push fan-out work/day | 20 million posts × 500 followers | 10 billion insertions |

## What matters most
Full push fan-out is about 116,000 timeline insertions/second on average before peaks. A celebrity can dominate work, so the average follower count is not enough to size workers.

If 10 million active users keep 500 post IDs each at 16 raw bytes per entry, that is about 80 GB of raw timeline data. Redis structures, keys and replicas cost more. Keep a bounded hot timeline rather than every user's entire history in memory.

At the assumed peak, 20 posts/page means up to 463,000 post-hydration items/second before batching and cache hits. Feed-page QPS is not the same as datastore QPS. All numbers require workload validation.`,
    say: "Feed reads are frequent, but fan-out can amplify each write hundreds or millions of times. I would size timeline delivery separately from API QPS and treat celebrity accounts as a different workload.",
    mistakes: ["Sizing storage and workers only from the number of published posts.", "Using an average follower count to dismiss celebrity hot spots.", "Equating one feed request with one database row read."],
  },
  {
    questions: ["How is a publishing retry distinguished from a new post?", "How does the client paginate a changing feed?", "Which keys support author history and both directions of follow lookup?"],
    example: `## Core contracts
Authenticated identity comes from the session/token, not a user ID supplied in the body.

    POST /posts
    Idempotency-Key: client-generated-request-id
    {"text":"Learning system design"}
    → 201 {"postId":"p123","createdAt":"2026-01-01T10:00:00Z"}

    GET /feed?limit=20&cursor=opaque-cursor
    → 200 {"items":[{"id":"p123","text":"Learning system design"}],"nextCursor":"..."}

Also define idempotent follow/unfollow operations. Return 400 for invalid content, 401 for an unauthenticated caller, and 429 for a known quota rejection. The server controls page-size bounds.

## Data access patterns
| Store | Keys and purpose |
|---|---|
| Posts | post_id; author_id + created_at index for author history. |
| Follows | Unique follower_id + followee_id; support both follower and following lookups. |
| Outbox | Durable event ID, post ID and publication state, committed with the post. |
| Timeline cache | user_id → bounded ordered post IDs and ordering metadata. |
| Idempotency records | caller + key → request hash and prior result, retained for a defined retry window. |

Use a cursor based on the last ordering tuple, such as created_at plus post_id, rather than a large offset. A cursor reduces shifting pages but does not create a snapshot by itself; deletions and delayed delivery can still change results. Reject a reused idempotency key with a different payload.`,
    say: "The feed API returns a bounded page and an opaque cursor. Timelines store IDs, not full copies of every post. I would enforce unique follow edges and make retried publishing requests idempotent within an agreed retention window.",
    mistakes: ["Trusting a body authorId instead of the authenticated caller.", "Using offset pagination while claiming a stable feed under concurrent writes.", "Claiming an idempotency key works without durable result storage and a retention policy."],
  },
  {
    questions: ["How are the saved post and fan-out event kept consistent?", "Where are post IDs hydrated, and how are visibility rules applied?", "What happens when a timeline cache is cold?"],
    example: `## Publish and propagate
Fan-out means distributing one post ID to many followers' timelines. An outbox is a durable record of an event saved in the same database transaction as its business data, then relayed for processing.

1. Validate the post and atomically save the post plus an outbox event in the durable store.
2. Return publication success after that commit. An event relay forwards outbox entries for asynchronous processing.
3. Fan-out workers look up follower relationships and append the post ID to bounded follower timelines.
4. Deduplicate delivery by a stable event/post ID. A crash after a write but before acknowledgement must not duplicate feed entries.

## Read and hydrate
1. The timeline service reads candidate post IDs from Redis.
2. Batch-load full posts from a post cache or the durable post store.
3. Apply deletion and current visibility rules, merge the author's recent posts, order the result and return a bounded page.
4. A cold or lost timeline needs a bounded rebuild/fallback from author histories. It must not be interpreted as an empty social graph.

## Read the whiteboard as a logical view
The dashed publication event includes the reliable outbox/relay or durable queue between the tweet service and workers. The board intentionally groups these mechanisms instead of drawing every deployment. The durable posts and follow graph are sources of truth; timeline Redis is derived data.`,
    say: "I would commit the post and an outbox event together. Workers then build follower timelines asynchronously. Reading loads IDs, hydrates posts in batches and checks visibility; the Redis timeline is a rebuildable view rather than the only copy.",
    mistakes: ["Saving a post and separately sending an event without considering the crash between them.", "Assuming at-least-once delivery cannot produce duplicate timeline entries.", "Returning an empty feed whenever a timeline cache is missing."],
  },
  {
    questions: ["Which authors should use push fan-out versus pull on read?", "How do we avoid duplicates when delivery is retried?", "How are deletions and visibility enforced while timelines are stale?"],
    example: `## Decision 1: push, pull or hybrid
Push on write precomputes follower timelines and makes reads cheap, but amplifies writes. Pull on read gathers recent posts from followed authors and merges them, avoiding mass fan-out but increasing read work.

Choose a hybrid: push ordinary authors; pull high-fan-out authors at read time and merge their recent posts with the cached timeline. Choose the threshold from follower counts, author activity, reader activity and worker capacity, not a universal magic number.

Deduplicate posts that appear in both sources during policy changes. A chronological merge needs consistent ordering tuples and bounded candidate fetches so a user following many popular authors cannot create unbounded work.

## Decision 2: reliable delivery and freshness
Outbox delivery and fan-out consumers are retryable. Store post IDs idempotently, checkpoint progress and monitor the age of undelivered events. Break a large author's follower list into bounded batches with checkpoints, not one giant transaction.

Deletion removes or invalidates the durable post; hydration must filter tombstones even if timeline cleanup is delayed. For private-account support, authorization on reads becomes more demanding and must be designed explicitly.

## Trade-off
The hybrid controls write amplification at the cost of a more complex read merge. Eventual timeline freshness is acceptable here; visibility and deletion are not safely implemented by trusting stale ID caches alone.`,
    say: "I would push posts for ordinary authors and pull high-fan-out authors during a bounded feed merge. This avoids a celebrity turning one publish into millions of immediate cache writes, but it makes reads and deduplication more complex.",
    mistakes: ["Applying push fan-out to every author without modelling amplification.", "Choosing a celebrity threshold without considering publishing and reading activity.", "Treating eventual feed ordering as permission to ignore current access rules."],
  },
  {
    questions: ["What should a reader see when fan-out is delayed?", "How is a lost timeline cache rebuilt without overwhelming the post store?", "Which metric measures the delay from publishing to visibility?"],
    example: `## Failure review
| Situation | Behavior |
|---|---|
| Workers fall behind | Publishing remains durable; timelines become stale. Monitor oldest pending event age and scale workers within datastore limits. |
| Redis timeline loss | Rebuild gradually and use bounded fallback reads. Avoid rebuilding every user's history at once. |
| Post store unavailable | Return a controlled failure or explicitly limited cached data according to visibility policy; never invent missing posts. |
| Celebrity traffic spike | Use the hybrid read path, batch hydration and hot-post caches. |
| Retries duplicate events | Deduplicate by stable IDs and make timeline writes idempotent. |

## Measure what the user experiences
Track publish durability errors, feed p95/p99 latency, hydration batch latency, timeline hit rate, post-to-visible delay, event backlog age, duplicate delivery rate and authorization/deletion filtering errors. Broker lag alone is not the whole freshness story.

## At 10× traffic
Load-test author/follower skew and page hydration, then partition durable data and worker jobs by measured access patterns. More partitions do not fix an unbounded hot author or an inefficient per-post read loop.

## Wrap up
We provide a chronological feed with durable posts, reliable asynchronous fan-out and a bounded hybrid read path. The main trade-off is feed freshness and merge complexity versus fast ordinary reads. Ranking, global writes and media are deliberate exclusions.`,
    say: "Our main risk is fan-out delay and amplification, not just API QPS. I would monitor post-to-visible delay and hydrate posts in batches. The feed may be briefly stale, but deletion and visibility rules still apply at read time.",
    mistakes: ["Calling successful enqueue proof that every follower can already see a post.", "Ignoring cache-rebuild storms or fan-out skew.", "Promising a latency target without testing realistic follower distributions."],
  },
];

export const NOTIFICATION_LESSON: LessonSection[] = [
  {
    questions: ["Which channels are needed, and which messages are urgent?", "Does success mean accepted, provider-accepted or delivered?", "How do opt-outs, retries and duplicate delivery work?"],
    example: `## Separate acceptance from delivery
Build an internal notification API for email, SMS and push. Product services submit an event, template and recipients; channel workers deliver it later.

| Clarifying question | Assumption |
|---|---|
| What does a successful API response mean? | Work was durably accepted, not delivered. |
| What is the volume? | 10 million notification intents/day, averaging two channel jobs each. |
| What is the delivery goal? | Most urgent jobs reach a provider within 5 seconds under normal load; this is a target to measure. |
| What are the priorities? | Transactional messages take precedence over bulk campaigns. |
| What are the correctness rules? | Respect channel preferences, bound retries and minimize duplicate sends. |

Use provider receipts/callbacks when available, but do not promise that a message was read. Exact delivery guarantees vary by provider. Recommendations, marketing segmentation and a visual template editor are outside scope.

Separate a password reset from a campaign: they may have different consent, urgency and expiry policies. Product policy must define those differences; 'transactional' is not a blanket reason to ignore all preferences.`,
    say: "I would separate durably accepting a notification from delivering it. Transactional and bulk jobs need different priorities, and provider acceptance is not proof of delivery or that a user read the message.",
    mistakes: ["Returning delivered as soon as a job is queued.", "Putting urgent password resets behind a large campaign backlog.", "Promising exactly-once user-visible delivery across all providers."],
  },
  {
    questions: ["How many channel jobs does one intent expand into?", "What sending limit does each provider impose?", "How long can a backlog wait, and how quickly can it drain while new jobs arrive?"],
    example: `## Estimate channel work, not just API calls
Assume 10 million intents/day, two channel jobs per intent, 10× peak traffic, a 1 KB queue envelope per job, and a 500-byte raw delivery-state record per job.

| Quantity | Calculation | Approximate result |
|---|---|---|
| Average API intents | 10 million ÷ 86,400 | 116/second |
| Average delivery jobs | 20 million ÷ 86,400 | 232/second |
| Peak jobs | 232 × 10 | 2,320/second |
| Raw daily queue ingress | 20 million × 1 KB | 20 GB/day |
| Raw state for 30 days | 20 million × 500 bytes × 30 | 300 GB |

## Provider bottleneck example
Suppose peak email traffic is 1,000 jobs/second but a provider permits 500/second. Backlog grows by 500/second. A ten-minute burst adds about 300,000 jobs, or 300 MB of raw 1 KB envelopes before broker overhead and replication.

If arrivals later fall to 200/second while capacity stays 500/second, spare capacity is 300/second. Draining that backlog takes about 1,000 seconds, or 17 minutes, before retries and other work.

Adding workers cannot exceed a provider's sending limit. Split traffic by channel/priority and size backlog retention for a realistic outage. Job envelopes should contain references and minimal necessary data, not large copies of templates or unnecessary personal information.`,
    say: "One API intent can produce several channel jobs. The provider's throughput is a hard downstream constraint: adding workers does not solve it. I would estimate backlog growth and drain time, not just average request volume.",
    mistakes: ["Counting one event as one send even when it targets several recipients or channels.", "Estimating backlog without subtracting ongoing arrival traffic during recovery.", "Assuming broker ingress size is the full replicated storage bill."],
  },
  {
    questions: ["Which durable event makes an accepted response truthful?", "How are submission retries deduplicated?", "Which per-channel states distinguish accepted, delivered, suppressed and failed?"],
    example: `## Submission contract
Authenticate the producing service and verify that it may use the chosen template and audience. Resolve recipient addresses from authorized server-side data.

    POST /notifications
    Idempotency-Key: order-123-confirmation
    {"recipientId":"u42","templateId":"order-confirmed","channels":["email"],"variables":{"orderId":"123"}}
    → 202 {"notificationId":"n456","status":"accepted"}

    GET /notifications/n456
    → 200 {"status":"processing","channels":[{"channel":"email","status":"provider_accepted"}]}

Restrict status access to authorized callers. A repeated idempotency key with the same payload returns the prior acceptance; a changed payload is rejected. Return 400 for invalid input, 429 for known producer quota rejection and 503 when durable acceptance cannot be achieved.

## Data model
| Entity | Important fields |
|---|---|
| Notification | ID, producing service, template version, recipient reference, expiry, priority. |
| Channel job | notification ID + channel + recipient, status, attempt count, next attempt time. |
| Attempt | Stable delivery key, provider request ID, timestamp, outcome/error class. |
| Preferences | Recipient, channel policy, locale, suppression/opt-out state. |
| Idempotency | Producer + key, payload hash, prior result, retention deadline. |

Use a unique job identity to avoid expanding a retried notification into duplicate jobs. Define accepted, suppressed, processing, provider_accepted, delivered, failed and expired states; do not label every non-error state delivered.`,
    say: "The API returns 202 only after durable acceptance. I would make submission idempotent, track each recipient-channel job separately and distinguish provider acceptance from confirmed delivery in the status model.",
    mistakes: ["Using one aggregate delivered flag for all recipients and channels.", "Allowing an untrusted service to send arbitrary templates or query another service's notifications.", "Implementing idempotency only in process memory."],
  },
  {
    questions: ["What durable write makes returning 202 safe?", "When do workers check consent and expiry?", "How are provider callbacks authenticated and ordered?"],
    example: `## Acceptance path
1. Authenticate the producer, validate the request and reserve its idempotency record.
2. Resolve template/version and applicable recipient preferences. Mark suppressed channels explicitly.
3. Durably persist accepted jobs and their outbox events in a transaction, or use a durable broker-first design with a clearly defined acceptance contract.
4. Return 202 after the chosen durable commit. The whiteboard's enqueue arrow abstracts this persistence/outbox relay.

## Delivery path
1. Channel-specific workers consume durable jobs with bounded concurrency and separate urgent/bulk capacity.
2. Recheck time-sensitive consent and job expiry; render from the intended template version.
3. Send through a provider adapter using a stable idempotency key where the provider supports it.
4. Record the outcome before acknowledging the job. Retry transient failures; suppress/expire or dead-letter permanent/exhausted failures as appropriate.

## Receipt path
Verify provider callback authenticity, deduplicate callback IDs and update delivery state. Handle callbacks arriving out of order; an old processing callback should not overwrite a later delivered state.

The queue decouples producers from slow providers, but does not make delivery instant. Delivery state and the pending-job source must support recovery if a worker crashes.`,
    say: "I would accept work durably and let channel workers deliver it later. Workers check expiry and preferences again before sending, record the result, and then acknowledge the job. Verified callbacks can move provider acceptance to confirmed delivery.",
    mistakes: ["Writing a database row and sending a queue message separately without recovery for the gap.", "Acknowledging a job before the send result is safely recorded.", "Trusting unsigned callbacks or applying older callbacks over newer terminal states."],
  },
  {
    questions: ["What happens if a worker crashes after the provider accepted the send?", "Which errors should retry, and when should a job stop?", "Can an alternate provider safely resend an ambiguous attempt?"],
    example: `## Decision 1: retries and duplicate sends
Assume at-least-once job delivery. A worker may send successfully and crash before recording success; the broker then redelivers the job.

A unique local job ID prevents duplicate expansion but cannot by itself undo an external send. Reuse a stable provider idempotency key when supported. Otherwise reconcile ambiguous outcomes with provider status where possible, or accept a documented duplicate risk. Exactly-once processing inside a broker does not automatically cover an external SMS or email provider.

## Decision 2: bounded recovery and priority isolation
Retry timeouts, rate limits and suitable temporary provider failures with exponential backoff and jitter. Honor provider retry guidance. Do not blindly retry invalid addresses or permanent opt-outs.

Set a maximum attempt count and an expiry deadline; a delayed password-reset job should not outlive the reset token. Keep urgent and bulk queues or capacity budgets separate, and rate-limit consumption to provider capacity. Record permanent or exhausted failures for inspection in a dead-letter workflow.

## Provider failover trade-off
An alternate provider can improve availability, but resend only after understanding whether the first provider may already have accepted the job. Switching providers on every timeout can create duplicate messages and increase cost. Replaying dead-letter jobs requires renewed validation, expiry checks and the same stable delivery identity.`,
    say: "The difficult failure is a crash after a provider accepted the send but before we recorded success. I would use stable provider idempotency when available and be honest about duplicate risk otherwise. Retries must stop at an attempt limit or expiry deadline.",
    mistakes: ["Claiming a local deduplication table guarantees exactly-once external delivery.", "Retrying invalid destinations forever.", "Failing over an ambiguous send to another provider without considering duplicates."],
  },
  {
    questions: ["How do we preserve urgent capacity during a campaign or provider outage?", "What is the recovery plan for expired or dead-letter jobs?", "Which signals separate provider acceptance, confirmed delivery and unknown outcomes?"],
    example: `## Failure and overload review
| Situation | Behavior |
|---|---|
| Email provider outage | Buffer within retention/expiry limits, back off and preserve urgent capacity. Do not spin in a tight retry loop. |
| Queue unavailable | Do not claim durable acceptance unless another durable job source/outbox has committed and can recover the work. |
| Worker crashes | Redeliver unacknowledged jobs; handle the external-send ambiguity using the agreed idempotency/reconciliation policy. |
| Campaign overwhelms capacity | Isolate bulk traffic; shed or defer producers before urgent delivery degrades. |
| Preferences change after enqueue | Recheck consent before send where policy requires it; record suppression. |

## Operational signals
Track accepted-to-provider latency by priority, oldest job age, backlog growth/drain rate, provider throttling/errors, attempts per job, duplicate-send indicators, suppression/expiry counts and dead-letter volume. Distinguish delivered receipts from provider acceptance and unknown outcomes.

Logs should identify a job without exposing addresses, message bodies or reset tokens unnecessarily. Test recovery and dead-letter replay rather than treating a queue as a backup.

## Wrap up
We durably accept notifications, isolate channels/priorities and deliver through bounded retryable workers. The main trade-off is delivery delay and recovery complexity versus a responsive producer API. Provider-specific guarantees limit what we can promise about final delivery.`,
    say: "The system keeps the producer API fast while channel workers absorb slow providers. I would monitor the age of urgent jobs, not just queue length. The design supports reliable recovery, but final delivery and duplicate guarantees depend on the provider contract.",
    mistakes: ["Monitoring only worker CPU while urgent jobs wait in the queue.", "Treating a dead-letter queue as a place to forget failures.", "Logging full message payloads or claiming final delivery without receipts."],
  },
];
