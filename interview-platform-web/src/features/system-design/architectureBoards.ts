export type BoardNode = {
  id: string; label: string; subtitle: string; x: number; y: number;
  kind?: "store" | "queue"; detail: string;
};
export type BoardEdge = {
  id: string; from: string; to: string; path: string;
  label: string; labelX: number; labelY: number; async?: boolean;
};
export type BoardFlow = { label: string; note: string; edges: string[]; steps: string[] };
export type ArchitectureBoard = {
  title: string; note: string; nodes: BoardNode[]; edges: BoardEdge[]; flows: BoardFlow[];
};

const boards: Record<string, ArchitectureBoard> = {
  "Design a URL Shortener": {
    title: "One short link. Two request paths.",
    note: "Keep redirects fast; store every mapping durably.",
    nodes: [
      { id: "client", label: "Client", subtitle: "browser / app", x: 30, y: 220, detail: "Creates a short link or follows an existing one. A redirect response sends the browser to the original destination." },
      { id: "gateway", label: "API gateway", subtitle: "route requests", x: 260, y: 220, detail: "Routes POST /api/shorten to the write service and GET /{code} to the read service. It is also a useful place for authentication and rate limiting." },
      { id: "write", label: "Write service", subtitle: "POST /api/shorten", x: 510, y: 80, detail: "Validates the destination, obtains a unique short code and persists the mapping before returning a short URL. Handle collisions with a unique database constraint." },
      { id: "read", label: "Read service", subtitle: "GET /{code}", x: 510, y: 360, detail: "Looks up the short code in Redis first. A cache miss falls back to the database; a successful lookup returns an HTTP redirect." },
      { id: "ids", label: "ID generator", subtitle: "unique short codes", x: 770, y: 80, detail: "Produces unique IDs that can be encoded as short codes. Uniqueness must hold across write-service instances; the database remains the final guard against collisions." },
      { id: "db", label: "Link database", subtitle: "code → destination", x: 770, y: 220, kind: "store", detail: "The durable source of truth for short-code mappings and optional expiry. On a cache miss, read the mapping here, then populate Redis." },
      { id: "cache", label: "Redis cache", subtitle: "hot links + TTL", x: 770, y: 420, kind: "store", detail: "Keeps popular mappings in memory. Expiry and cache invalidation must agree with link expiry; a cache failure should not erase durable mappings." },
    ],
    edges: [
      { id: "in", from: "client", to: "gateway", path: "M 210 260 Q 235 257 260 260", label: "HTTPS", labelX: 235, labelY: 243 },
      { id: "post", from: "gateway", to: "write", path: "M 350 220 L 350 120 Q 350 118 510 120", label: "create", labelX: 428, labelY: 102 },
      { id: "code", from: "write", to: "ids", path: "M 690 120 Q 730 116 770 120", label: "allocate ID", labelX: 730, labelY: 100 },
      { id: "save", from: "write", to: "db", path: "M 600 160 L 600 260 L 770 260", label: "persist mapping", labelX: 666, labelY: 244 },
      { id: "get", from: "gateway", to: "read", path: "M 350 300 L 350 400 L 510 400", label: "redirect", labelX: 425, labelY: 384 },
      { id: "hit", from: "read", to: "cache", path: "M 690 420 Q 730 438 770 450", label: "1. check cache", labelX: 705, labelY: 475 },
      { id: "miss", from: "read", to: "db", path: "M 660 360 L 715 310 L 770 290", label: "2. if missing", labelX: 718, labelY: 335 },
    ],
    flows: [
      { label: "Create a link", note: "Write path", edges: ["in", "post", "code", "save"], steps: ["The client submits a destination URL.", "The write service validates it and obtains a unique short code.", "Persist the mapping before returning the short URL."] },
      { label: "Follow a link", note: "Read path", edges: ["in", "get", "hit", "miss"], steps: ["The browser requests an existing short code.", "The read service checks Redis; a hit avoids a database read.", "On a miss, read the database and fill the cache. Return a 301/302 redirect, or 404 if the code does not exist."] },
    ],
  },
  "Design a Rate Limiter": {
    title: "Decide before the request reaches your service.",
    note: "The shared counter must be checked and updated atomically.",
    nodes: [
      { id: "client", label: "Client", subtitle: "user / IP / API key", x: 30, y: 160, detail: "Sends requests with an identity. Decide whether limits apply per user, API key, IP, route, or a combination; IP alone can group many people behind one network." },
      { id: "gateway", label: "API gateway", subtitle: "identify the caller", x: 270, y: 160, detail: "Extracts a trusted caller identity and routes the request through the limiter. Do not trust an arbitrary client-supplied user ID." },
      { id: "limiter", label: "Rate limiter", subtitle: "check + decide", x: 510, y: 160, detail: "Checks and updates shared state atomically, then decides whether to allow the request. Define fail-open versus fail-closed behavior for Redis outages." },
      { id: "backend", label: "Backend", subtitle: "allowed requests only", x: 770, y: 160, detail: "Only allowed requests reach expensive business logic. Rate limiting protects capacity but does not replace authorization or input validation." },
      { id: "redis", label: "Redis", subtitle: "counters + expiry", x: 510, y: 380, kind: "store", detail: "Stores shared counters or token-bucket state with expiry. Use a Lua script or another atomic operation so parallel requests cannot overspend the same budget." },
      { id: "reject", label: "429 response", subtitle: "Retry-After", x: 30, y: 380, detail: "Returns Too Many Requests without calling the backend. Retry-After tells the caller when it may retry; clients should back off instead of retrying immediately." },
    ],
    edges: [
      { id: "in", from: "client", to: "gateway", path: "M 210 200 Q 240 197 270 200", label: "request", labelX: 240, labelY: 182 },
      { id: "check", from: "gateway", to: "limiter", path: "M 450 200 Q 480 197 510 200", label: "identity", labelX: 480, labelY: 182 },
      { id: "state", from: "limiter", to: "redis", path: "M 570 240 Q 565 310 570 380", label: "atomic update", labelX: 493, labelY: 314 },
      { id: "decision", from: "redis", to: "limiter", path: "M 635 380 Q 640 310 635 240", label: "remaining budget", labelX: 718, labelY: 324 },
      { id: "allow", from: "limiter", to: "backend", path: "M 690 200 Q 730 197 770 200", label: "under limit", labelX: 730, labelY: 182 },
      { id: "deny", from: "limiter", to: "reject", path: "M 510 220 L 340 220 L 340 420 L 210 420", label: "over limit", labelX: 351, labelY: 351 },
    ],
    flows: [
      { label: "Allow request", note: "Within budget", edges: ["in", "check", "state", "decision", "allow"], steps: ["Resolve a trusted caller identity.", "Atomically check and update the shared counter in Redis.", "If the request fits the budget, forward it to the backend."] },
      { label: "Reject request", note: "Budget exhausted", edges: ["in", "check", "state", "decision", "deny"], steps: ["The same caller sends another request.", "The shared state shows the budget is exhausted.", "Return 429 and Retry-After to the caller. Do not invoke the backend."] },
    ],
  },
  "Design Twitter / News Feed": {
    title: "Write once. Prepare timelines for fast reads.",
    note: "Fan-out is asynchronous; a celebrity account may need a hybrid strategy.",
    nodes: [
      { id: "client", label: "Client", subtitle: "post / open feed", x: 30, y: 220, detail: "Publishes a post or opens a home timeline. These have different performance goals: publishing must persist the post, while reading should feel immediate." },
      { id: "tweet", label: "Tweet service", subtitle: "validate + publish", x: 270, y: 80, detail: "Persists a post and reliably schedules a fan-out event. An outbox or equivalent recovery mechanism prevents a saved post from losing its delivery event." },
      { id: "db", label: "Tweet database", subtitle: "durable posts", x: 510, y: 80, kind: "store", detail: "The durable post store holds post ID, author, content and timestamp. Timelines contain IDs; fetch full posts from this store or a post cache." },
      { id: "fanout", label: "Fan-out workers", subtitle: "async delivery", x: 510, y: 250, kind: "queue", detail: "Consumes publication events and inserts post IDs into followers' timeline caches. Work must be retryable and idempotent to avoid duplicate feed entries." },
      { id: "graph", label: "Social graph", subtitle: "who follows whom", x: 770, y: 80, kind: "store", detail: "Stores follow relationships. Fan-out workers consult it to find recipients; access checks and unfollow behavior must also be considered." },
      { id: "timeline", label: "Timeline service", subtitle: "read + hydrate IDs", x: 270, y: 420, detail: "Reads recent IDs from the user's timeline cache, then hydrates them into full posts. Use a fallback/rebuild strategy if a cache entry is missing." },
      { id: "cache", label: "Timeline cache", subtitle: "Redis · post IDs / user", x: 770, y: 420, kind: "store", detail: "Stores bounded, ordered lists of recent post IDs per user. It optimizes feed reads; it is not the durable source of truth for the posts themselves." },
    ],
    edges: [
      { id: "post", from: "client", to: "tweet", path: "M 120 220 L 120 120 L 270 120", label: "publish", labelX: 193, labelY: 103 },
      { id: "save", from: "tweet", to: "db", path: "M 450 120 Q 480 117 510 120", label: "persist", labelX: 480, labelY: 102 },
      { id: "event", from: "tweet", to: "fanout", path: "M 360 160 L 360 290 L 510 290", label: "post event", labelX: 428, labelY: 272, async: true },
      { id: "followers", from: "fanout", to: "graph", path: "M 690 275 L 720 275 L 720 120 L 770 120", label: "followers", labelX: 729, labelY: 220 },
      { id: "push", from: "fanout", to: "cache", path: "M 600 330 L 600 460 L 770 460", label: "append IDs", labelX: 683, labelY: 444, async: true },
      { id: "read", from: "client", to: "timeline", path: "M 120 300 L 120 460 L 270 460", label: "open feed", labelX: 194, labelY: 443 },
      { id: "fetch", from: "timeline", to: "cache", path: "M 450 480 L 770 480", label: "recent post IDs", labelX: 604, labelY: 510 },
      { id: "hydrate", from: "timeline", to: "db", path: "M 435 420 L 475 365 L 475 145 L 510 145", label: "load full posts", labelX: 465, labelY: 352 },
    ],
    flows: [
      { label: "Publish a post", note: "Write + asynchronous fan-out", edges: ["post", "save", "event", "followers", "push"], steps: ["Persist the new post before acknowledging publication.", "Deliver a reliable post event to fan-out workers; find the author's followers.", "Append the post ID to each follower's cached timeline. Retries must not duplicate entries."] },
      { label: "Read a feed", note: "Fast read path", edges: ["read", "fetch", "hydrate"], steps: ["The client asks the timeline service for its home feed.", "Read recent post IDs from the user's Redis timeline.", "Hydrate those IDs into full posts, apply access checks, and return an ordered page."] },
    ],
  },
  "Design a Notification System": {
    title: "Accept quickly. Deliver in the background.",
    note: "A successful API response means accepted, not necessarily delivered.",
    nodes: [
      { id: "producer", label: "Product services", subtitle: "events + recipients", x: 30, y: 160, detail: "Produces events such as a password reset or a new message. Include a stable notification ID so retried requests can be deduplicated." },
      { id: "api", label: "Notification API", subtitle: "validate + accept", x: 270, y: 160, detail: "Validates the request, checks preferences, prepares the template and enqueues work. Return an acceptance response after work is durably queued." },
      { id: "prefs", label: "Preferences", subtitle: "templates + opt-outs", x: 270, y: 380, kind: "store", detail: "Stores templates, locale, channel choices and opt-outs. Check these before queueing; workers may recheck consent before delayed delivery." },
      { id: "queue", label: "Message queue", subtitle: "durable channel topics", x: 510, y: 160, kind: "queue", detail: "Buffers bursts and isolates push, SMS and email workloads. Consumers acknowledge work only after handling it, and retry with backoff when delivery fails." },
      { id: "workers", label: "Channel workers", subtitle: "push / SMS / email", x: 770, y: 160, detail: "Consumes channel-specific jobs, calls providers and records status. Respect provider limits; use idempotency where supported to reduce duplicate deliveries." },
      { id: "providers", label: "Delivery providers", subtitle: "APNs · FCM · SMS · email", x: 770, y: 380, detail: "External providers accept delivery requests. Acceptance is not proof of final delivery; callbacks or receipts update delivery status where available." },
      { id: "status", label: "Delivery state", subtitle: "attempts · retry / DLQ", x: 510, y: 380, kind: "store", detail: "Records attempts and delivery status. Transient failures retry with bounded backoff; permanent failures or exhausted retries go to a dead-letter queue for inspection, not back into the retry loop." },
    ],
    edges: [
      { id: "request", from: "producer", to: "api", path: "M 210 200 Q 240 197 270 200", label: "event", labelX: 240, labelY: 182 },
      { id: "prefs", from: "api", to: "prefs", path: "M 360 240 Q 356 310 360 380", label: "consent + template", labelX: 269, labelY: 316 },
      { id: "enqueue", from: "api", to: "queue", path: "M 450 200 Q 480 197 510 200", label: "enqueue", labelX: 480, labelY: 182, async: true },
      { id: "consume", from: "queue", to: "workers", path: "M 690 200 Q 730 197 770 200", label: "consume", labelX: 730, labelY: 182, async: true },
      { id: "deliver", from: "workers", to: "providers", path: "M 860 240 Q 856 310 860 380", label: "send", labelX: 890, labelY: 316 },
      { id: "status", from: "workers", to: "status", path: "M 810 240 L 720 315 L 660 380", label: "record outcome", labelX: 719, labelY: 346 },
      { id: "retry", from: "status", to: "queue", path: "M 565 380 Q 528 310 565 240", label: "bounded retry", labelX: 493, labelY: 316, async: true },
    ],
    flows: [
      { label: "Deliver notification", note: "Asynchronous delivery", edges: ["request", "prefs", "enqueue", "consume", "deliver", "status"], steps: ["Validate the event and resolve recipient preferences and the template.", "Durably enqueue the job; channel workers consume it independently.", "Call the delivery provider and record the outcome. Provider acceptance is not final delivery."] },
      { label: "Handle a failure", note: "Retry + recovery", edges: ["status", "retry", "consume", "deliver"], steps: ["Record the failed attempt and classify the failure.", "Retry transient failures with bounded exponential backoff and deduplication.", "Move exhausted or permanent failures to the dead-letter queue instead of retrying forever."] },
    ],
  },
};

// Match known case titles, not database-generated IDs. Unknown cases retain their
// original Markdown rather than being shown an unrelated architecture.
export function getArchitectureBoard(title: string): ArchitectureBoard | undefined {
  const key = Object.keys(boards).find(name => name.toLowerCase() === title.trim().toLowerCase());
  return key ? boards[key] : undefined;
}

export function withoutAsciiSketch(markdown: string): string {
  let removed = false;
  return markdown.replace(/```[^\n]*\n[\s\S]*?```/g, block => {
    if (removed || !block.includes("-->")) return block;
    removed = true;
    return "";
  }).trim();
}
