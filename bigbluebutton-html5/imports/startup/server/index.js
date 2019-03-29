import { Meteor } from 'meteor/meteor';
import { WebAppInternals } from 'meteor/webapp';
import Langmap from 'langmap';
import Users from '/imports/api/users';
import fs from 'fs';
import './settings';
import Logger from './logger';
import Redis from './redis';

var parse = Npm.require('url').parse;

const AVAILABLE_LOCALES = fs.readdirSync('assets/app/locales');

Meteor.startup(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  const env = Meteor.isDevelopment ? 'development' : 'production';
  const CDN_URL = APP_CONFIG.cdn;

  if (CDN_URL.trim()) {
    // Add CDN
    BrowserPolicy.content.disallowEval();
    BrowserPolicy.content.allowInlineScripts();
    BrowserPolicy.content.allowInlineStyles();
    BrowserPolicy.content.allowImageDataUrl(CDN_URL);
    BrowserPolicy.content.allowFontDataUrl(CDN_URL);
    BrowserPolicy.content.allowOriginForAll(CDN_URL);
    WebAppInternals.setBundledJsCssPrefix(CDN_URL + APP_CONFIG.basename);

    var fontRegExp = /\.(eot|ttf|otf|woff|woff2)$/;

    WebApp.rawConnectHandlers.use('/', function(req, res, next) {
      if (fontRegExp.test(req._parsedUrl.pathname)) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Origin');
        res.setHeader('Pragma', 'public');
        res.setHeader('Cache-Control', '"public"');
      }
      return next();
    });
  }

  Logger.warn(`SERVER STARTED.\nENV=${env},\nnodejs version=${process.version}\nCDN=${CDN_URL}\n`, APP_CONFIG);
});

WebApp.connectHandlers.use('/check', (req, res) => {
  const payload = { html5clientStatus: 'running' };

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(payload));
});

WebApp.connectHandlers.use('/locale', (req, res) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const fallback = APP_CONFIG.defaultSettings.application.fallbackLocale;
  const browserLocale = req.query.locale.split(/[-_]/g);
  const localeList = [fallback];

  const usableLocales = AVAILABLE_LOCALES
    .map(file => file.replace('.json', ''))
    .reduce((locales, locale) => (locale.match(browserLocale[0])
      ? [...locales, locale]
      : locales), []);

  const regionDefault = usableLocales.find(locale => browserLocale[0] === locale);

  if (regionDefault) localeList.push(regionDefault);
  if (!regionDefault && usableLocales.length) localeList.push(usableLocales[0]);

  let normalizedLocale;
  let messages = {};

  if (browserLocale.length > 1) {
    normalizedLocale = `${browserLocale[0]}_${browserLocale[1].toUpperCase()}`;
    localeList.push(normalizedLocale);
  }

  localeList.forEach((locale) => {
    try {
      const data = Assets.getText(`locales/${locale}.json`);
      messages = Object.assign(messages, JSON.parse(data));
      normalizedLocale = locale;
    } catch (e) {
      Logger.warn(`'Could not process locale ${locale}:${e}`);
      // Getting here means the locale is not available in the current locale files.
    }
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ normalizedLocale, messages }));
});

WebApp.connectHandlers.use('/locales', (req, res) => {
  let locales = [];
  try {
    locales = AVAILABLE_LOCALES
      .map(file => file.replace('.json', ''))
      .map(file => file.replace('_', '-'))
      .map(locale => ({
        locale,
        name: Langmap[locale].nativeName,
      }));
  } catch (e) {
    Logger.warn(`'Could not process locales error: ${e}`);
  }

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(locales));
});

WebApp.connectHandlers.use('/feedback', (req, res) => {
  req.on('data', Meteor.bindEnvironment((data) => {
    const body = JSON.parse(data);
    const {
      meetingId,
      userId,
      authToken,
    } = body;

    const user = Users.findOne({
      meetingId,
      userId,
      connectionStatus: 'offline',
      authToken,
    });

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
