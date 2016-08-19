import { logger } from '/imports/startup/server/logger';
import '/server/server';
import { RedisPubSub } from '/imports/startup/server/RedisPubSub';
import { EventQueue } from '/imports/startup/server/EventQueue';
import { clearCollections } from '/imports/api/common/server/helpers';

Meteor.startup(function () {
  redisPubSub = new RedisPubSub();

  clearCollections();
  const APP_CONFIG = Meteor.settings.public.app;

  let determineConnectionType = function () {
    let baseConnection = 'HTTP';
    if (APP_CONFIG.httpsConnection) {
      baseConnection += ('S');
    }

    return baseConnection;
  };

  logger.info(`server start. Connection type:${determineConnectionType()}`);
});

WebApp.connectHandlers.use('/check', (req, res, next) => {
  let payload = { html5clientStatus: 'running' };

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(payload));
});

export const myQueue = new EventQueue();

export const eventEmitter = new (Npm.require('events').EventEmitter);

export let redisPubSub = {};
