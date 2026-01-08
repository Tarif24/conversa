// userRateLimiter.js
class RateLimitManager {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.userMessages = new Map(); // userId -> array of timestamps
    }

    canSend(userId) {
        const now = Date.now();
        const timestamps = this.userMessages.get(userId) || [];

        // Filter recent timestamps
        const recent = timestamps.filter(time => now - time < this.windowMs);

        // Check limit
        if (recent.length >= this.maxRequests) {
            return false;
        }

        // Add timestamp
        recent.push(now);
        this.userMessages.set(userId, recent);
        return true;
    }

    getRemaining(userId) {
        const now = Date.now();
        const timestamps = this.userMessages.get(userId) || [];
        const recent = timestamps.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - recent.length);
    }

    cleanup() {
        const now = Date.now();
        for (const [userId, timestamps] of this.userMessages.entries()) {
            const recent = timestamps.filter(time => now - time < this.windowMs);
            if (recent.length === 0) {
                this.userMessages.delete(userId);
            } else {
                this.userMessages.set(userId, recent);
            }
        }
    }
}

export default RateLimitManager;
