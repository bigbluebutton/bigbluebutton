import { logger } from '/imports/startup/server/logger';

import { RedisPubSub } from '/imports/startup/server/redispubsub2';
import { EventQueue } from '/imports/startup/server/EventQueue';

import '/server/server';

export const myQueue = new EventQueue();

logger.info('server start');

export const eventEmitter = new (Npm.require('events').EventEmitter);

export const redisPubSub = new RedisPubSub();

// TODO
/*

-clear collections somewhere

 */