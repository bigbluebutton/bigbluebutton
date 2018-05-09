import { Meteor } from 'meteor/meteor';
import Langmap from 'langmap';
import Users from '/imports/api/users';
import fs from 'fs';
import Logger from './logger';
import Redis from './redis';

Meteor.startup(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  const env = Meteor.isDevelopment ? 'development' : 'production';
  Logger.warn(`SERVER STARTED. ENV=${env}, nodejs version=${process.version}`, APP_CONFIG);
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
  const localeRegion = req.query.locale.split(/[-_]/g);
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
      normalizedLocale = locale;
    } catch (e) {
      // Getting here means the locale is not available on the files.
    }
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ normalizedLocale, messages }));
});

WebApp.connectHandlers.use('/locales', (req, res) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const defaultLocale = APP_CONFIG.defaultSettings.application.locale;

  let availableLocales = [];

  const defaultLocaleFile = `${defaultLocale}.json`;
  const defaultLocalePath = `locales/${defaultLocaleFile}`;
  const localesPath = Assets.absoluteFilePath(defaultLocalePath).replace(defaultLocaleFile, '');

  try {
    const getAvailableLocales = fs.readdirSync(localesPath);
    availableLocales = getAvailableLocales
      .map(file => file.replace('.json', ''))
      .map(file => file.replace('_', '-'))
      .map(locale => ({
        locale,
        name: Langmap[locale].nativeName,
      }));
  } catch (e) {
    // Getting here means the locale is not available on the files.
  }

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(availableLocales));
});

WebApp.connectHandlers.use('/feedback', (req, res) => {
  req.on('data', Meteor.bindEnvironment((data) => {
    const body = JSON.parse(data);
    const {
      meetingId,
      userId,
    } = body;


    const user = Users.findOne({ meetingId, userId });
    const feedback = {
      userName: user.name,
      ...body,
    };
    Logger.info('FEEDBACK LOG:', feedback);
  }));

  req.on('end', Meteor.bindEnvironment(() => {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
  }));
});


export const eventEmitter = Redis.emitter;

export const redisPubSub = Redis;
