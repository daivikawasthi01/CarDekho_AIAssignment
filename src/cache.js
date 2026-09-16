/**
 * In-Memory TTL Cache to avoid hammering remote delivery endpoints
 * and enable instant response times on repeat queries.
 */

class SimpleTTLCache {
    constructor(ttlMs = 120000) {
        this.ttlMs = ttlMs;
        this.cache = new Map();
    }

    get(key) {
        const normalizedKey = String(key).trim().toLowerCase();
        const entry = this.cache.get(normalizedKey);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(normalizedKey);
            return null;
        }

        return entry.value;
    }

    set(key, value, customTtlMs = null) {
        const normalizedKey = String(key).trim().toLowerCase();
        const ttl = customTtlMs || this.ttlMs;
        this.cache.set(normalizedKey, {
            value,
            expiresAt: Date.now() + ttl,
            cachedAt: new Date().toISOString()
        });
    }

    clear() {
        this.cache.clear();
    }
}

module.exports = SimpleTTLCache;
