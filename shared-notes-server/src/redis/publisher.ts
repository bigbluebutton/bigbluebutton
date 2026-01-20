import { createClient, RedisClientOptions } from 'redis';
import { config } from '../config';
import { Logger } from '../common/logger';

const logger = new Logger('publisher');

const { publish: channels } = config.redis.channels;
const channel = channels[0]; // Get the first publish channel
const { redis: settings } = config;

const options: RedisClientOptions = {
  socket: {
    host: settings.host,
    port: settings.port,
  }
};

const publisher = createClient(options);

const publish = (message: string) => {
  publisher.publish(channel, message);
  logger.debug('published', { message });
};

export { publish };
