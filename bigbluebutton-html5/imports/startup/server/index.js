import { Meteor } from 'meteor/meteor';
import Locales from '/imports/locales';
import Logger from './logger';
import Redis from './redis';

Meteor.startup(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  Logger.info(`SERVER STARTED. ENV=${Meteor.settings.runtime.env}`, APP_CONFIG);
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

export const eventEmitter = Redis.emitter;

export let redisPubSub = Redis;
