import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => logger.error(`Redis Error: ${err}`));
redisClient.on('connect', () => logger.info('Redis connected successfully.'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;
