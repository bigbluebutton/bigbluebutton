import { logger } from '/server/logger';

import { RedisPubSub } from '/server/redispubsub2';
import { EventQueue } from '/server/EventQueue';

export const myQueue = new EventQueue();

logger.info('server start');

export const eventEmitter = new (Npm.require('events').EventEmitter);

export const redisPubSub = new RedisPubSub();

// TODO
/*

-clear collections somewhere

 */