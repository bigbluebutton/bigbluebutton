import * as redis from 'redis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from '../config';

export const createRedisClient = () => {
  // Build Redis URL, including password if provided.
  const redisPassword = REDIS_PASSWORD ? `:${encodeURIComponent(REDIS_PASSWORD)}@` : '';
  const redisUrl = `redis://${redisPassword}${REDIS_HOST}:${REDIS_PORT}`;

  // Create Redis Client with the specified options.
  const redisClient = redis.createClient({
    url: redisUrl, // Construct URL from host, port, and optional password.
    disableOfflineQueue: true, // Disable offline queueing of commands.
    name: 'bbb-graphql-actions', // Assign a name to this client.
    socket: {
      reconnectStrategy: (times) => 500 // Reconnect strategy with a fixed delay.
    }
  });

  // Log errors that occur with the Redis client.
  redisClient.on('error',  async (err: Error) => {
    console.error('Redis Error:', err.message);
  });

  return redisClient;
};
