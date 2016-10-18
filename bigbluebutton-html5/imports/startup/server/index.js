import '/server/server';
import Locales from '/imports/locales';
import Logger from './logger';
import Redis from './redis';
import { EventQueue } from '/imports/startup/server/EventQueue';
import { clearCollections } from '/imports/api/common/server/helpers';

Meteor.startup(() => {
  clearCollections();
  const APP_CONFIG = Meteor.settings.public.app;

  let determineConnectionType = function () {
    let baseConnection = 'HTTP';
    if (APP_CONFIG.httpsConnection) {
      baseConnection += ('S');
    }

    return baseConnection;
  };

  Logger.info(`server start. Connection type:${determineConnectionType()}`);
  Logger.info('APP_CONFIG=');
  Logger.info(APP_CONFIG);
  Logger.info('Running in environment type:' + Meteor.settings.runtime.env);
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

export const eventEmitter = Redis.emitter;

export let redisPubSub = Redis;
