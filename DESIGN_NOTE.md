# Architectural & System Design Note
**Application:** Grocery Price Compare ("The Great Grocery Price Race")  
**Target Submission:** CarDekho Group Campus Build Challenge  

---

## 1. Overall System Architecture & Trade-Off Analysis

### Selected Architecture
We designed a **modular, multi-tier search engine** featuring a **Node.js/Express API server**, **parallel Playwright browser context scrapers**, **in-memory TTL caching (120s)**, and a **deterministic normalization & fuzzy matching layer**.

```
[Web Client (SPA)] ──GET /api/search?q=...──► [Express API Server] ──► [In-Memory TTL Cache]
                                                      │ (Cache Miss)
                                                      ▼
                                       ┌──────────────────────────────┐
                                       │ Parallel Scraper Orchestrator│
                                       │ (Promise.allSettled Manager) │
                                       └──────────────┬───────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
           [Blinkit Scraper Service]                                     [Instamart Scraper Service]
   (Playwright + XHR Sniffing + DOM Fallback)                    (Async Retries + Backoff + Bot Status Reporting)
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      ▼
                                       ┌──────────────────────────────┐
                                       │ Normalization & Matcher      │
                                       │ (Brand/Size Gate + Fuzzy)    │
                                       └──────────────┬───────────────┘
                                                      ▼
                                       ┌──────────────────────────────┐
                                       │ Structured Health & Match API│
                                       └──────────────────────────────┘
```

### Alternatives Evaluated & Architectural Decisions
1. **Static Catalog / Seeded Database**:
   - *Why Rejected:* Grocery prices and stock fluctuate continuously throughout the day. A static database fails the core problem statement of delivering location-relevant real-time prices.
2. **Direct Reverse-Engineered API Replay**:
   - *Why Rejected as Primary:* Modern quick-commerce web platforms (Swiggy Instamart in particular) deploy Cloudflare bot management, TLS fingerprinting, and dynamic token headers (`swiggy_com_load_error_bots`). Direct curl/HTTP replays hit 403 blocks instantly.
3. **Playwright Headless Context + Async Retries & Honest Failure Reporting (Chosen)**:
   - *Why Chosen:* Playwright evaluates dynamic JavaScript, passes geolocation headers, and intercepts live layout JSONs. When anti-bot security challenges an automated browser, our scraper executes **asynchronous retries with exponential backoff** (`SCRAPER_MAX_RETRIES = 2`). If challenges persist, the API **transparently reports store health status** rather than hiding behind silent mock data for arbitrary queries (e.g. *"namkeen"*, *"bingo"*).

---

## 2. Product Matching Mechanics & Failure Modes

### 5-Stage Matching Engine
1. **Sanitization & Filler Removal**: Strips marketing noise (`combo pack`, `super saver`, `buy 1 get 1 free`) and normalizes punctuation.
2. **Brand Extraction**: Maps vendor titles against a normalized brand alias dictionary (`nestle maggi` $\rightarrow$ `maggi`, `tata salt` $\rightarrow$ `tata`, `coca-cola` $\rightarrow$ `coke`).
3. **Canonical Pack Size Canonicalization**: Converts weights (`1.2 kg` $\rightarrow$ `1200 g`), volumes (`1 L` $\rightarrow$ `1000 ml`), item counts (`10 pcs`), and multipacks (`70 g x 12` $\rightarrow$ `840 g`).
4. **Hard Brand & Size Gating**: Listings match **ONLY IF** `Brand_A === Brand_B` AND `Size_A.formatted === Size_B.formatted`. Size mismatch strictly prevents a 100g pack and a 500g pack of butter from pairing.
5. **Fuzzy Descriptor Scoring**: Computes Token Jaccard + Levenshtein distance on descriptors. Matches are bucketed into **Confident Matches ($\ge 80\%$)**, **Likely Matches ($65\% - 79\%$)**, and **Single Platform Listings**.

### Failure Modes Analysis
- **Private Labels & Store Exclusives:** Store-branded produce (*"Swiggy Instamart Stainless Steel Noodle Bowl"*) has no cross-platform equivalent.
- **Multipack vs. Single-Unit Listing:** Size gating correctly rejects matching a 12-pack against a single 70g pack to preserve head-to-head unit cost accuracy.
- **Loose Produce Sold by Weight:** Fresh produce sold by variable weight (*"Onion 1kg"* vs *"Onion 500g"*) requires per-gram unit pricing rather than fixed pack matching.

---

## 3. Low-Level Design (LLD), Production Quality & Security

- **Modularity & Layered LLD:** Clear separation between `Scraper Services`, `Matching Engine`, `TTL Cache`, and `Express Controllers`.
- **Query Sanitization & Security:** Search inputs are sanitized, trimmed, and capped to 100 characters to prevent injection attacks and memory exhaustion.
- **Per-Store Execution Metadata:** API payloads return granular store health metadata (`storeStatuses: { blinkit: { success, count, attempts }, instamart: { success, count, attempts, error } }`).

---

## 4. Scaling Strategy: Multi-Location & High Traffic

- **Dynamic Location Context:** Scraper services accept `latitude`, `longitude`, and `pincode` as request parameters, enabling multi-city delivery support without redeployment.
- **Decoupled Scraping Worker Pool:** For 100,000+ users, scraping is decoupled from the HTTP request path into background worker queues (BullMQ/Redis) with headless browser pools.
- **Distributed Redis Cache:** Replace local memory cache with Redis using stale-while-revalidate TTLs, combined with background crons pre-fetching top SKUs per pincode.
