# Architectural & Product Design Note
**Application:** Grocery Price Compare ("The Great Grocery Price Race")  
**Target Submission:** CarDekho Group Campus Build Challenge  

---

## 1. Overall System Architecture & Trade-Off Analysis

### Selected Architecture
We built a **hybrid real-time scraper + intelligent matching engine** powered by a lightweight **Node.js/Express API server** and **Playwright browser context automation**, backed by an **in-memory TTL cache (120s)**.

```
[Web Client (SPA)] ──GET /api/search?q=...──► [Express API Server] ──► [In-Memory TTL Cache]
                                                      │ (Cache Miss)
                                                      ▼
                                       ┌──────────────────────────────┐
                                       │ Concurrent Scraper Manager   │
                                       │ (Promise.allSettled Parallel)│
                                       └──────────────┬───────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
           [Blinkit Scraper Engine]                                       [Instamart Scraper Engine]
   (Playwright + XHR Sniffing + DOM Fallback)                    (Playwright + Anti-Bot Fixture Fallback)
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      ▼
                                       ┌──────────────────────────────┐
                                       │ Normalization & Matcher      │
                                       │ (Brand/Size Gate + Fuzzy)    │
                                       └──────────────────────────────┘
```

### Alternatives Evaluated & Rationale
1. **Seeded Database / Pre-cached Store**:
   - *Why Rejected:* Grocery pricing and stock fluctuate continuously throughout the day. A seeded database would be a static catalog demo, failing the core requirement of comparing live prices for a specific delivery location.
2. **Direct Reverse-Engineered HTTP APIs (Replay)**:
   - *Why Rejected as Primary:* Desktop web applications heavily employ anti-bot measures (Cloudflare bot management, TLS fingerprinting, CSRF tokens, dynamic headers). Replaying internal endpoints directly without a browser session breaks frequently and risks IP bans.
3. **Playwright Headless Browser Automation (Chosen Strategy)**:
   - *Why Chosen:* Simulates genuine desktop user interactions within a full browser context, properly evaluates dynamic JavaScript, passes geolocation headers, and survives minor frontend layout updates. To eliminate single points of failure during screen recordings or automated evaluations, we pair live Playwright execution with an automatic **Mock Fixture Fallback** mode (`--mock` flag).

---

## 2. Product Matching Logic & Honest Failure Modes

### How Matching Works
Our matching engine evaluates products through a strict 5-stage pipeline:
1. **Text Normalization & Noise Stripping**: Strips promotional filler (`combo pack`, `super saver`, `buy 1 get 1 free`, `special offer`) and standardizes punctuation.
2. **Brand Extraction**: Maps vendor titles against a normalized brand alias dictionary (`nestle maggi` $\rightarrow$ `maggi`, `tata salt` $\rightarrow$ `tata`, `coca-cola` $\rightarrow$ `coke`).
3. **Canonical Pack Size Parsing**: Standardizes metric weights (`1.2 kg` $\rightarrow$ `1200 g`), volumes (`1 L` $\rightarrow$ `1000 ml`), item counts (`10 pcs`), and multipacks (`70 g x 12` $\rightarrow$ `840 g`).
4. **Hard Brand & Size Gating**: Listings match **ONLY IF** `Brand_A === Brand_B` AND `Size_A.formatted === Size_B.formatted`. A 100g pack and a 500g pack of butter are strictly prevented from matching regardless of title similarity.
5. **Fuzzy Descriptor Scoring & Categorization**: Evaluates remaining descriptor tokens via Token Jaccard + Levenshtein distance.
   - **Confident Match ($\ge 80\%$):** Pairs products and calculates exact savings ($\Delta$).
   - **Likely Match ($65\% - 79\%$):** Pairs products with visual uncertainty flags.
   - **Unmatched:** Displays items in store-exclusive columns.

### Where Matching Logic Breaks Down (Honest Failure Analysis)
- **Private Labels & White-Label Products:** Instamart items like *"Swiggy Instamart Fresh Organic Bananas"* have no equivalent brand on Blinkit.
- **Multipack vs. Single Pack Discrepancies:** If Blinkit lists *"Maggi 70g (Pack of 4)"* and Instamart lists *"Maggi 70g Single Pack"*, size gating correctly rejects them, but the user loses a head-to-head single unit comparison.
- **Loose Produce Sold by Variable Weight:** Fresh vegetables (e.g., *"Onion 1 kg"* vs *"Onion 500g Pack"*) have fluctuating daily per-gram pricing that standard pack parsing does not convert to unit rates.
- **Variant Naming Nuances:** Minor recipe variants (*"Maggi Masala"* vs *"Maggi Masala Magic"*) can blur descriptor boundaries if brand dictionary coverage is incomplete.

---

## 3. Scaling Architecture: Multi-Location & High Traffic

### Scaling to 100+ Delivery Locations
- **Dynamic Context Pools:** Rather than single hardcoded geolocation context, the scraper accepts `latitude`, `longitude`, and `pincode` as request parameters.
- **Location-Aware Cache Keys:** Cache keys expand from `q` to `(query, pincode, lat_lon)`.

### Scaling to 100,000+ Concurrent Users
- **Scraping Worker Pool & Job Queue:** Browser automation per incoming HTTP request is the first layer to collapse under load. Scraping must be decoupled from the API request path into an asynchronous worker pool (BullMQ / Celery) with headless browser pools (Puppeteer/Playwright Cluster).
- **Distributed Caching (Redis):** Replace local in-memory cache with a distributed Redis cluster using stale-while-revalidate TTL strategies for trending search queries.
- **Proactive Background Scraping:** Schedule cron workers to continuously pre-fetch and cache the top 1,000 most searched grocery SKUs every 15 minutes per major pincode. Users hit instant cache responses ($< 10\text{ms}$), while live scraping is triggered only for long-tail queries.
