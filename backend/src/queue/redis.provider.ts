import IORedis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new IORedis(url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
