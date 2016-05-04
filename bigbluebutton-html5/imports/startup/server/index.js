import { logger } from '/imports/startup/server/logger';
import '/server/server';
import { RedisPubSub } from '/imports/startup/server/RedisPubSub';
import { EventQueue } from '/imports/startup/server/EventQueue';
import { clearCollections } from '/imports/startup/server/helpers';

Meteor.startup(function(){
  clearCollections();
  logger.info('server start');
});

export const myQueue = new EventQueue();

export const eventEmitter = new (Npm.require('events').EventEmitter);

export const redisPubSub = new RedisPubSub();
