import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import Logger from './logger';
import Redis from './redis';
import locales from '../../utils/locales';

const availableLocales = [];

Meteor.startup(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  Logger.info(`SERVER STARTED. ENV=${Meteor.settings.runtime.env}`, APP_CONFIG);
});

WebApp.connectHandlers.use('/check', (req, res, next) => {
  const payload = { html5clientStatus: 'running' };

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(payload));
});

WebApp.connectHandlers.use('/locale', (req, res) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const defaultLocale = APP_CONFIG.defaultLocale;
  const localeRegion = req.query.locale.split('-');
  let messages = {};
  const locales = [defaultLocale, localeRegion[0]];
  let statusCode = 200;
  if (localeRegion.length > 1) {
    locales.push(`${localeRegion[0]}_${localeRegion[1].toUpperCase()}`);
  }

  locales.forEach((locale) => {
    try {
      const data = Assets.getText(`locales/${locale}.json`);
      messages = Object.assign(messages, JSON.parse(data));
    } catch (e) {
      // Variant Also Negotiates Status-Code, to alert the client that we
      // do not support the following lang.
      // https://en.wikipedia.org/wiki/Content_negotiation
      statusCode = 506;
    }
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ statusCode, messages }));
});

WebApp.connectHandlers.use('/locales', (req, res) => {
  if (!availableLocales.length) {
    locales.forEach((l) => {
      try {
        Assets.absoluteFilePath(`locales/${l.locale}.json`);
        availableLocales.push(l);
      } catch (e) {
        // Getting here means the locale is not available on the files.
      }
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(availableLocales));
});

export const eventEmitter = Redis.emitter;

export const redisPubSub = Redis;
