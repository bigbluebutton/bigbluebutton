import * as redis from 'redis';
import { REDIS_HOST, REDIS_PORT } from '../config';

export const createRedisClient = () => {
  const redisClient = redis.createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`
  });

  redisClient.on('error', handleRedisError);

  return redisClient;
};

export const handleRedisError = (err: Error) => {
  console.error('Redis Error:', err);
  process.exit(1);
};

