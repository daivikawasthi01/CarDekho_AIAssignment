# ⚡ Grocery Price Compare ("The Great Grocery Price Race")
> A real-time web application comparing grocery prices across **Blinkit** and **Swiggy Instamart** for a configured delivery location (Koramangala 4th Block, Bengaluru). Built for CarDekho Group Campus Build Challenge.

---

## 🌟 Key Features
- **One-Search Comparison:** Search any grocery item (e.g., "Maggi", "Amul Butter", "Tata Salt", "Atta") to view head-to-head prices from Blinkit and Instamart.
- **Configurable Delivery Location:** Configured to fetch live prices for Koramangala 4th Block, Bengaluru (`560034`).
- **Intelligent Product Normalizer & Matcher:** Extracts brands, canonical pack sizes (`1.2kg` $\rightarrow$ `1200g`, `70g x 12` $\rightarrow$ `840g`), strips marketing noise, enforces hard brand & size gates, and categorizes results into **Confident Matches**, **Likely Matches**, and **Unmatched Store Listings**.
- **Resilient Playwright Scraper:** Uses Playwright headless Chromium for live scraping with an automatic mock fixture fallback system (`--mock` flag / `USE_MOCK=true`) to withstand anti-bot Cloudflare challenges.
- **In-Memory TTL Cache (120s):** Delivers sub-10ms response times on repeat queries while maintaining low request volume to source platforms.
- **Glassmorphic Dark-Mode UI:** Sleek, responsive Web UI with savings indicators and quick-search pills.

---

## 🛠️ Prerequisites & Tech Stack
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Browser Automation**: Playwright (Chromium)
- **Backend**: Express.js
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), ES6 JavaScript

---

## 🚀 Quick Start Guide

### 1. Install Dependencies & Playwright Browser
Open your terminal in the project directory and run:
```bash
npm install
```
*(The `postinstall` script automatically downloads the headless Chromium binary via `npx playwright install chromium`).*

### 2. Start the Application
Run the Express server:
```bash
npm start
```
Or for live auto-reloading development mode:
```bash
npm run dev
```

### 3. Open Web UI
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Testing & Mock Fixture Mode

### Run Matching Engine Unit Tests
Verify canonical size parsing and product matcher logic:
```bash
npm test
```

### Toggle Mock Fixture Fallback Mode
If remote store anti-bot protections interrupt live scraping during evaluation or video recording, launch in mock mode:
```bash
USE_MOCK=true npm start
```
Or append `&mock=true` to any API URL:
```
http://localhost:3000/api/search?q=maggi&mock=true
```

---

## 📁 Repository Structure
```
CarDekho_Assignment/
├── DESIGN_NOTE.md             # One-page architectural & design document
├── README.md                  # Setup & run instructions
├── package.json               # Dependencies & scripts
├── zip_submission.sh          # Script to generate submission zip archive
├── test/
│   ├── test_matching.js       # Normalizer & matcher unit tests
├── src/
│   ├── config.js              # Delivery location lat/lon, pincode, TTL settings
│   ├── cache.js               # In-memory TTL cache
│   ├── server.js              # Express API server & routes
│   ├── scrapers/
│   │   ├── blinkitScraper.js  # Playwright & XHR layout scraper for Blinkit
│   │   ├── instamartScraper.js# Playwright & API scraper for Instamart
│   │   ├── mockFixtures.js    # Pre-populated real snapshot fixture store
│   │   └── index.js           # Concurrent scraper orchestration
│   ├── matching/
│   │   ├── normalizer.js      # Brand extraction & pack size canonicalizer
│   │   └── matcher.js         # Gating engine & confidence scorer
│   └── public/
│       ├── index.html         # Modern web application UI
│       ├── styles.css         # Glassmorphic responsive dark mode styles
│       └── app.js             # Client UI state & API renderer
```

---

## 📦 Packaging for Submission
To build the submission `.zip` file excluding `node_modules` and build caches:
```bash
bash zip_submission.sh
```
This generates `CarDekho_Grocery_Compare.zip` in the project root ready for upload!
