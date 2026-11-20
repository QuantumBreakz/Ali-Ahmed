/** Topic hubs: ordered reading paths through the blog, one page per cluster. A post belongs to at most one hub. */
export interface TopicSection {
  heading: string;
  posts: string[]; // blog slugs, in reading order
}

export interface Topic {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  intro: string[];
  sections: TopicSection[];
  faq: { question: string; answer: string }[];
}

export const topics: Topic[] = [
  {
    slug: "kyc-identity-verification",
    title: "KYC and identity verification engineering",
    shortTitle: "KYC engineering",
    description:
      "A guide to building KYC and identity verification systems: document capture, OCR, passport MRZ parsing, NFC chips, face match, liveness, fraud signals, sanctions screening and handling personal data, with tested code.",
    intro: [
      "Identity verification turns a photo of a document and a selfie into a decision: is this a real document, does it belong to this person, and is the person present? I've worked on these pipelines at ShuftiPro, and these articles cover the engineering behind each step, with code you can run.",
      "Start with the overview, then follow the pipeline in order: getting a clean image, reading the document's data, checking the face, looking for fraud, and screening the person.",
    ],
    sections: [
      {
        heading: "How verification works",
        posts: ["how-kyc-identity-verification-works", "kyc-vs-aml-vs-kyb", "mqtt-kyc-verification-pipeline"],
      },
      {
        heading: "Capturing a usable image",
        posts: [
          "validate-file-uploads-magic-bytes-nodejs",
          "exif-orientation-before-ocr",
          "document-photo-preprocessing-ocr",
          "ocr-non-latin-scripts-arabic-urdu",
        ],
      },
      {
        heading: "Reading and checking document data",
        posts: [
          "passport-mrz-check-digits",
          "mrz-ocr-error-correction",
          "mrz-date-century-expiry",
          "nfc-epassport-chip-verification",
          "pakistan-cnic-number-validation",
          "luhn-iban-check-digits",
        ],
      },
      {
        heading: "Face match, liveness and fraud signals",
        posts: [
          "face-match-threshold-far-frr",
          "face-liveness-detection-explained",
          "duplicate-id-photo-perceptual-hash",
          "model-calibration-ece-temperature-scaling",
        ],
      },
      {
        heading: "Screening and personal data",
        posts: ["sanctions-name-screening-fuzzy-matching", "homoglyph-mixed-script-detection", "redact-pii-logs-llm-prompts-python"],
      },
    ],
    faq: [
      {
        question: "What are the steps in KYC identity verification?",
        answer:
          "Capture a photo of the identity document and a selfie, check image quality, read the document with OCR and the machine-readable zone, check the document's security features or NFC chip, compare the selfie with the document photo, confirm the person is live, then screen the name against sanctions and PEP lists. Each failed check should carry a reason the user can act on.",
      },
      {
        question: "Does a valid MRZ check digit prove a passport is genuine?",
        answer:
          "No. Check digits only catch misreads and typos; anyone can compute them. Authenticity comes from the document's physical security features or, on e-passports, from the digitally signed data on the NFC chip.",
      },
      {
        question: "Does a Pakistani CNIC number have a check digit?",
        answer:
          "No. A CNIC is 13 digits (12345-1234567-1): a locality code whose first digit is the region, a serial, and a final digit that is odd for men and even for women. Format checks catch malformed input, but only verification against NADRA's records confirms the number belongs to the person.",
      },
      {
        question: "How do you choose a face match threshold?",
        answer:
          "Measure false accepts and false rejects on labelled pairs at several thresholds, then pick the point that matches the risk: a lower false accept rate for high-value accounts, a lower false reject rate where friction loses customers. Check the rates per segment, such as device type, because one global number can hide a group that fails far more often.",
      },
    ],
  },
  {
    slug: "production-llm-engineering",
    title: "Production LLM engineering",
    shortTitle: "LLM engineering",
    description:
      "A guide to running LLM features in production: retries, rate limits, concurrency, structured output, context windows, streaming, cancellation, gateways, caching, cost and evaluation, with tested Node.js and Python.",
    intro: [
      "Calling an LLM API in a demo takes one line. Running it for real users means handling rate limits, overloaded providers, malformed output, conversations longer than the context window, streams that break mid-answer, costs that drift, and quality you have to measure rather than assume.",
      "These articles cover each of those problems with tested code. Most of the patterns come from work on LLM gateways, including fixes I contributed to LiteLLM.",
    ],
    sections: [
      {
        heading: "Calling LLM APIs reliably",
        posts: [
          "llm-api-retries-backoff-fallbacks",
          "llm-rate-limiter-token-bucket-nodejs",
          "limit-concurrent-promises-nodejs",
          "asyncio-semaphore-timeout-concurrency",
          "llm-structured-output-validation",
          "llm-context-window-trimming",
        ],
      },
      {
        heading: "Streaming responses",
        posts: ["parse-sse-llm-stream-nodejs", "nextjs-sse-proxy-streaming", "cancel-llm-request-client-disconnect-nodejs"],
      },
      {
        heading: "Gateways, caching and cost",
        posts: [
          "what-is-an-llm-gateway-litellm",
          "reduce-llm-api-costs",
          "semantic-cache-llm-responses",
          "llm-router-savings-deployment-id",
          "litellm-context-compression-bug",
          "first-litellm-contribution",
        ],
      },
      {
        heading: "Quality and evaluation",
        posts: ["stop-llm-inventing-numbers", "llm-judge-agreement-cohen-kappa"],
      },
    ],
    faq: [
      {
        question: "Which LLM API errors should you retry?",
        answer:
          "Retry 429 rate-limit responses, 5xx server errors, overloaded responses (such as Anthropic's 529) and timeouts, with exponential backoff and full jitter, and honour Retry-After when it's sent. Never retry 400-class errors such as a malformed or over-long request: they fail the same way every time.",
      },
      {
        question: "How do you stay under an LLM provider's rate limits?",
        answer:
          "Providers usually limit both requests per minute and tokens per minute. A client-side token bucket for each, reserving an estimated token count before the call and correcting it with the real usage afterwards, avoids most 429s. Cap concurrency separately, and keep retries behind the limiter.",
      },
      {
        question: "What is an LLM gateway?",
        answer:
          "A service that sits between your applications and LLM providers, giving them one API while it handles keys, routing between models, retries, fallbacks, rate limits, caching and cost tracking in one place. LiteLLM is a widely used open-source example.",
      },
      {
        question: "How do you know an LLM judge is reliable?",
        answer:
          "Grade at least 100 real examples with both humans and the judge, and compare them with Cohen's kappa rather than raw agreement, because a judge that passes everything can agree 90% of the time when 90% of answers pass. For pairwise judges, also swap the answer order to check for position bias.",
      },
    ],
  },
  {
    slug: "ai-agents",
    title: "AI agents: tool calling, MCP and security",
    shortTitle: "AI agents",
    description:
      "A guide to building AI agents: how tool calling works, the Model Context Protocol, single vs multi-agent designs, tool error messages, evaluation, OAuth, audit logs, prompt injection and canary tokens.",
    intro: [
      "An agent is an LLM in a loop: it decides which tool to call, reads the result, and decides again. The model is the easy part. The engineering is in the tools it calls, the errors it reads, the permissions it holds, and the attacks that arrive through the text it processes.",
      "These articles go from how the tool-calling loop works to securing and auditing agents that act on real systems.",
    ],
    sections: [
      {
        heading: "How agents work",
        posts: ["llm-tool-calling-explained", "what-is-model-context-protocol", "single-agent-vs-multi-agent", "agent-tool-error-messages"],
      },
      {
        heading: "Testing and accountability",
        posts: ["evaluating-ai-agents", "ai-agent-audit-log-hash-chain"],
      },
      {
        heading: "Security",
        posts: [
          "prompt-injection-scraped-data-llm-outreach",
          "canary-tokens-system-prompt-leaks",
          "oauth-mcp-server-crm",
          "localhost-is-not-authentication",
          "voice-ai-webhook-security",
          "whatsapp-sender-identity-normalization",
        ],
      },
    ],
    faq: [
      {
        question: "How does LLM tool calling work?",
        answer:
          "You describe each tool to the model with a name and a JSON schema. The model replies with a tool call instead of text, your code runs the tool and sends the result back, and the loop repeats until the model answers. The model never runs code itself; your application does.",
      },
      {
        question: "What is the Model Context Protocol (MCP)?",
        answer:
          "An open protocol for connecting AI applications to tools and data sources. A server exposes tools, resources and prompts in a standard way, so any MCP-compatible client can use them without custom integration code.",
      },
      {
        question: "How do you detect a system prompt leak?",
        answer:
          "Put a random canary string in the system prompt and check every model output and tool call argument for it, including spaced-out and encoded copies. A match means an injection succeeded; block the response and investigate. It catches copying, not paraphrase.",
      },
      {
        question: "Should you use one agent or several?",
        answer:
          "Start with one agent and good tools. Split into several only when parts of the work need different instructions, tools or permissions, can run in parallel, or should independently check another agent's output. Each extra agent adds coordination, latency, cost and new ways to fail.",
      },
    ],
  },
  {
    slug: "rag-and-search",
    title: "RAG and search: retrieval for LLM applications",
    shortTitle: "RAG and search",
    description:
      "A guide to retrieval-augmented generation: embeddings and vector search, chunking, BM25 and hybrid search with reciprocal rank fusion, SQLite FTS5, deduplication with MinHash, evaluation and offline RAG.",
    intro: [
      "Retrieval-augmented generation answers questions from your own documents by finding the relevant passages and giving them to the model. Most RAG failures are retrieval failures: the right passage was never found, was split in the wrong place, or was crowded out by duplicates.",
      "These articles cover retrieval end to end, from how embeddings work to measuring whether retrieval actually improved.",
    ],
    sections: [
      {
        heading: "Retrieval foundations",
        posts: ["embeddings-vector-search-explained", "rag-chunking-strategies", "minhash-near-duplicate-documents-rag"],
      },
      {
        heading: "Keyword and hybrid search",
        posts: ["hybrid-search-bm25-reciprocal-rank-fusion", "sqlite-fts5-bm25-search-python"],
      },
      {
        heading: "Evaluating and running RAG",
        posts: ["rag-retrieval-evaluation-metrics", "offline-rag-chatbot-ollama"],
      },
    ],
    faq: [
      {
        question: "Why does vector search miss exact terms like invoice numbers?",
        answer:
          "Embeddings capture what a passage is about, not its exact tokens, so two passages about invoices land close together whatever the invoice number. Keyword search such as BM25 matches exact tokens. Hybrid search runs both and merges the rankings.",
      },
      {
        question: "What is reciprocal rank fusion?",
        answer:
          "A way to merge ranked lists from different retrievers using only ranks: each document scores 1 / (k + rank) in each list, the scores are added, and k = 60 is the usual default. It needs no score normalisation or training.",
      },
      {
        question: "How do you evaluate RAG retrieval?",
        answer:
          "Build a set of real questions with the passages that answer them, then measure recall@k (was a correct passage retrieved?) and MRR (how high was it?). Split results by query type, so a change that helps exact-match queries can't hide a loss on paraphrased ones.",
      },
    ],
  },
  {
    slug: "reliable-backends",
    title: "Reliable backends in Node.js and Python",
    shortTitle: "Reliable backends",
    description:
      "A guide to backend reliability patterns: idempotent webhooks and idempotency keys, the transactional outbox, graceful shutdown, request IDs, back-pressure, JWT verification, DST-safe scheduling, SLOs and latency percentiles.",
    intro: [
      "Most production incidents aren't exotic. A webhook arrives twice, a retry charges a card again, an event is lost between a database commit and a queue, a deploy drops requests, or a dashboard averages percentiles. Each has a well-known fix.",
      "These articles implement those fixes in Node.js and Python, each with tests that reproduce the failure first.",
    ],
    sections: [
      {
        heading: "Doing things exactly once",
        posts: ["idempotent-webhooks-nodejs", "idempotency-keys-post-api-nodejs", "transactional-outbox-nodejs-sqlite"],
      },
      {
        heading: "Running servers",
        posts: [
          "nodejs-graceful-shutdown-kubernetes",
          "node-http-backpressure-bytes",
          "request-id-logging-asynclocalstorage",
          "jwt-verification-pitfalls-nodejs",
        ],
      },
      {
        heading: "Time and measurement",
        posts: [
          "schedule-jobs-local-time-dst-python",
          "latency-percentiles-p95-averaging",
          "slo-error-budget-burn-rate",
          "servicemonitor-labels-vs-annotations",
        ],
      },
    ],
    faq: [
      {
        question: "How do you make a webhook handler idempotent?",
        answer:
          "Claim the event ID in the database with a unique constraint before doing the work, mark it done afterwards, release the claim if the work fails so a retry can run, and take over claims that have gone stale because a worker crashed.",
      },
      {
        question: "What is the transactional outbox pattern?",
        answer:
          "Write a state change and the event announcing it into the same database transaction, using an outbox table, so both are saved or neither is. A relay then publishes events from the table in order, retrying until they succeed. Delivery is at least once, so consumers must be idempotent.",
      },
      {
        question: "Why can't you average p95 latencies?",
        answer:
          "Percentiles don't combine by averaging: the p95 of two servers together depends on their full distributions and how many requests each handled. Merge the raw samples, histograms with shared buckets, or a mergeable sketch such as t-digest, and compute the percentile from the combined data.",
      },
    ],
  },
];

export const topicPath = (topic: Topic) => `/topics/${topic.slug}/`;

export function topicForPost(slug: string): Topic | undefined {
  return topics.find((topic) => topic.sections.some((section) => section.posts.includes(slug)));
}
