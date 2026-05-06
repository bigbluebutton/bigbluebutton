import { createClient, RedisClientOptions } from 'redis';
import config from '../config';
import { Logger } from '../common/logger';

const logger = new Logger('publisher');

const { publish: channels } = config.redis.channels;
const channel = channels[0]; // Get the first publish channel
const { redis: settings } = config;

const options: RedisClientOptions = {
  password: settings.password ?? undefined,
  socket: {
    host: settings.host,
    port: settings.port,
  }
};

const publisher = createClient(options);

// Connect the publisher client
try {
  await publisher.connect();
} catch (err) {
  logger.error('Failed to connect publisher', { error: err });
}

// Handle connection errors
publisher.on('error', (err) => {
  logger.error('Publisher error', { error: err });
});

const publish = (message: string) => {
  if (!publisher.isOpen) {
    logger.error('Publisher is not connected');
    return;
  }
  publisher.publish(channel, message);
  logger.debug('published', { message });
};

export { publish };
