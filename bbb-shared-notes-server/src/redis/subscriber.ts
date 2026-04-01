import { createClient, RedisClientOptions } from 'redis';
import config from '../config';
import handler from './handler';
import { Logger } from '../common/logger';

const logger = new Logger('redis');

const { subscribe: channels } = config.redis.channels;
const { redis: settings } = config;

const options: RedisClientOptions = {
  password: settings.password ?? undefined,
  socket: {
    host: settings.host,
    port: settings.port,
  }
};

const subscriber = createClient(options);

// Connection event handlers
subscriber.on('connect', () => {
  logger.info('Redis subscriber connecting...');
});

subscriber.on('ready', () => {
  logger.info('Redis subscriber connected and ready', {
    host: settings.host,
    port: settings.port
  });
});

subscriber.on('error', (err) => {
  logger.error('Redis subscriber error', { error: err.message });
});

subscriber.on('end', () => {
  logger.info('Redis subscriber connection closed');
});

subscriber.on('reconnecting', () => {
  logger.warn('Redis subscriber reconnecting...');
});

const startRedis = async () => {
  try {
    logger.info('Connecting to Redis...', {
      host: settings.host,
      port: settings.port
    });

    await subscriber.connect();

    logger.info('Subscribing to channels...', { channels });
    for (const channel of channels) {
      await subscriber.subscribe(channel, (message) => {
        handler.handle(message);
      });
      logger.info('subscribed', { channel });
    }
  } catch (error) {
    logger.error('Failed to start Redis subscriber', { error });
    throw error;
  }
};

export default startRedis;
