import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
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
  const APP_CONFIG = Meteor.settings.public.app;

  let defaultLocale = APP_CONFIG.defaultLocale;
  let localeRegion = _.snakeCase(req.query.locale).split('_');
  let messages = {};

  let locales = [defaultLocale, localeRegion[0], 'james'];

  if (localeRegion.length > 1) {
    locales.push(`${localeRegion[0]}_${localeRegion[1]}`);
  }

  locales.forEach(locale => {
    try {
      const data = Assets.getText(`locales/${locale}.json`);
      messages = Object.assign(messages, JSON.parse(data));
    } catch (e) {
      // console.error(e);
      // We dont really care about those errors since they will be a parse error
      // or a file not found which is ok
    }
  });

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(messages));
});

export const eventEmitter = Redis.emitter;

export let redisPubSub = Redis;
