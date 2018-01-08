import { Meteor } from 'meteor/meteor';
import Logger from './logger';
import Redis from './redis';
import locales from '../../utils/locales';

let DEFAULT_LANGUAGE = null;
const availableLocales = [];

Meteor.startup(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  Logger.info(`SERVER STARTED. DEV_ENV=${Meteor.isDevelopment} PROD_ENV=${Meteor.isProduction}`, APP_CONFIG);

  DEFAULT_LANGUAGE = Meteor.settings.public.app.defaultSettings.application.locale
});

WebApp.connectHandlers.use('/check', (req, res) => {
  const payload = { html5clientStatus: 'running' };

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(payload));
});

WebApp.connectHandlers.use('/locale', (req, res) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const defaultLocale = APP_CONFIG.defaultSettings.application.locale;
  const localeRegion = req.query.locale.split(/[-_]/g);;
  const localeList = [defaultLocale, localeRegion[0]];

  let normalizedLocale = localeRegion[0];
  let messages = {};

  if (localeRegion.length > 1) {
    normalizedLocale = `${localeRegion[0]}_${localeRegion[1].toUpperCase()}`;
    localeList.push(normalizedLocale);
  }

  localeList.forEach((locale) => {
    try {
      const data = Assets.getText(`locales/${locale}.json`);
      messages = Object.assign(messages, JSON.parse(data));
      normalizedLocale = locale
    } catch (e) {
      // Getting here means the locale is not available on the files.
    }
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ normalizedLocale, messages }));
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
