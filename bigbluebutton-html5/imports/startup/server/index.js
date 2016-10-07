import { logger } from '/imports/startup/server/logger';
import '/server/server';
import { RedisPubSub } from '/imports/startup/server/RedisPubSub';
import { EventQueue } from '/imports/startup/server/EventQueue';
import { clearCollections } from '/imports/api/common/server/helpers';
import { Meteor } from 'meteor/meteor';
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
  let availableTranslations = ['en', 'en-US', 'pt-BR'];
  let defaultMessages = {};
  let newMessages = {};
  let languageRegion = null;
  let language = null;
  let foundl = false;
  let foundlr = false;

  let browserLang = req.query.locale.split('-');

  if (browserLang[1]) {
    languageRegion = browserLang[0] + '-' + browserLang[1].toUpperCase();
    language = browserLang[0];
  } else {
    language = browserLang[0];
  }

  defaultMessages = Locales[defaultLocale];

  for (i = 0; i < availableTranslations.length; i++) {
    if (languageRegion == availableTranslations[i]) {
      foundlr = true;
    } else if (language == availableTranslations[i]) {
      foundl = true;
    }
  }

  if (foundlr) {
    newMessages = Locales[languageRegion];
    foundlr = false;
  }else if (foundl) {
    newMessages = Locales[language];
    foundl = false;
  } else {
    newMessages = defaultMessages;
  }

  let merged = {};
  Object.assign(merged, defaultMessages, newMessages);

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(merged));
});

export const myQueue = new EventQueue();

export const eventEmitter = new (Npm.require('events').EventEmitter);

export let redisPubSub = {};
