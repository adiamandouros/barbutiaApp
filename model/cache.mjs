const CACHE_TTL = 2 * 60 * 1000; // 2 minutes — matches the scraping interval

class AppCache {
    constructor() {
        this._store = new Map();
    }

    set(key, value) {
        this._store.set(key, { value, expiresAt: Date.now() + CACHE_TTL });
    }

    get(key) {
        const entry = this._store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this._store.delete(key);
            return null;
        }
        return entry.value;
    }

    invalidate(key) {
        this._store.delete(key);
    }
}

export const cache = new AppCache();
