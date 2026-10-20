import * as redis from 'redis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from '../config';

export const createRedisClient = () => {
  // The password is optional; it is URL-encoded so characters such as @, / or # survive.
  const credentials = REDIS_PASSWORD ? `:${encodeURIComponent(REDIS_PASSWORD)}@` : '';

  // Create Redis Client with the specified options.
  const redisClient = redis.createClient({
    url: `redis://${credentials}${REDIS_HOST}:${REDIS_PORT}`, // Construct URL from host, port and optional password.
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
