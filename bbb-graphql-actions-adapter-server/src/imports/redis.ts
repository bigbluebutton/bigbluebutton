import * as redis from 'redis';
import { REDIS_HOST, REDIS_PORT } from '../config';
import { promisify } from 'util';

export const createRedisClient = () => {
  const redisClient = redis.createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    disableOfflineQueue: true,
    name: 'bbb-graphql-actions-adapter-server',
    socket: {
      reconnectStrategy: (times) => {
        return 500;
      }
    }
  });

  redisClient.on('error',  async (err: Error) => {
    console.error('Redis Error:', err.message);
  });

  return redisClient;
};
