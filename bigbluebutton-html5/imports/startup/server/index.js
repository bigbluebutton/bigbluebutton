import { logger } from '/imports/startup/server/logger';
import '/server/server';
import { RedisPubSub } from '/imports/startup/server/RedisPubSub';
import { EventQueue } from '/imports/startup/server/EventQueue';
import { clearCollections } from '/imports/api/common/server/helpers';

Meteor.startup(function () {
  clearCollections();
  logger.info('server start');
});

WebApp.connectHandlers.use('/check', (req, res, next) => {
  let payload = { html5clientStatus: 'running' };

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(payload));
});

export const myQueue = new EventQueue();

export const eventEmitter = new (Npm.require('events').EventEmitter);

export const redisPubSub = new RedisPubSub();
