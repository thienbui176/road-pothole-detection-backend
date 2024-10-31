export const cacheConfig = () => ({
    redis: {
        url: process.env.REDIS_URL,
        ttl: parseInt(process.env.REDIS_TTL, 10) || 60,
    },
});
