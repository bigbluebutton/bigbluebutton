import * as redis from 'redis';
import { REDIS_HOST, REDIS_PORT } from '../config';

export const createRedisClient = () => {
  // Create Redis Client with the specified options.
  const redisClient = redis.createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`, // Construct URL from host and port.
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
