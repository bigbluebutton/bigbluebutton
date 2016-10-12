import { logger } from '/imports/startup/server/logger';
import '/server/server';
import { RedisPubSub } from '/imports/startup/server/RedisPubSub';
import { EventQueue } from '/imports/startup/server/EventQueue';
import { clearCollections } from '/imports/api/common/server/helpers';
import  Locales  from '/imports/locales';

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
  logger.info('APP_CONFIG=');
  logger.info(APP_CONFIG);
  logger.info('Running in environment type:' + Meteor.settings.runtime.env);
});

WebApp.connectHandlers.use('/check', (req, res, next) => {
  let payload = { html5clientStatus: 'running' };

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(payload));
});

WebApp.connectHandlers.use('/locale', (req, res) => {

  let defaultLocale = 'en';
  let [locale, region] = req.query.locale.split('-');

  const defaultMessages = Locales[defaultLocale];

  let messages = Object.assign(
    {},
    defaultMessages,
    Locales[locale],
    Locales[`${locale}-${region}`],
  );

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(messages));

});

export const myQueue = new EventQueue();

export const eventEmitter = new (Npm.require('events').EventEmitter);

export let redisPubSub = {};
