import { createClient, RedisClientOptions } from 'redis';
import config from '../config';
import handler from './handler';
import { Logger } from '../common/logger';

const logger = new Logger('redis');

const { subscribe: channels } = config.redis.channels;
const { redis: settings } = config;

const options: RedisClientOptions = {
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

subscriber.on('subscribe', (channel) => {
  logger.info('subscribed', { channel });
});

subscriber.on('message', (channel, message) => {
  const msg = typeof message === 'object' ? message : JSON.parse(message);
  handler.handle(msg);
});

const startRedis = async () => {
  try {
    logger.info('Connecting to Redis...', {
      host: settings.host,
      port: settings.port
    });

    await subscriber.connect();

    logger.info('Subscribing to channels...', { channels });
    channels.forEach((channel) => subscriber.subscribe(channel, handler.handle));
  } catch (error) {
    logger.error('Failed to start Redis subscriber', { error });
    throw error;
  }
};

export default startRedis;
