import { Meteor } from 'meteor/meteor';
import { WebAppInternals } from 'meteor/webapp';
import Langmap from 'langmap';
import fs from 'fs';
import Users from '/imports/api/users';
import './settings';
import { lookup as lookupUserAgent } from 'useragent';
import { check } from 'meteor/check';
import Logger from './logger';
import Redis from './redis';
import setMinBrowserVersions from './minBrowserVersion';
import userLeaving from '/imports/api/users/server/methods/userLeaving';

const AVAILABLE_LOCALES = fs.readdirSync('assets/app/locales');

Meteor.startup(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  const INTERVAL_IN_SETTINGS = (Meteor.settings.public.pingPong.clearUsersInSeconds) * 1000;
  const INTERVAL_TIME = INTERVAL_IN_SETTINGS < 10000 ? 10000 : INTERVAL_IN_SETTINGS;
  const env = Meteor.isDevelopment ? 'development' : 'production';
  const CDN_URL = APP_CONFIG.cdn;

  // Commenting out in BBB 2.3 as node12 does not allow for `memwatch`.
  // We are looking for alternatives

  /* let heapDumpMbThreshold = 100;

  const memoryMonitoringSettings = Meteor.settings.private.memoryMonitoring;
  if (memoryMonitoringSettings.stat.enabled) {
    memwatch.on('stats', (stats) => {
      let heapDumpTriggered = false;

      if (memoryMonitoringSettings.heapdump.enabled) {
        heapDumpTriggered = (stats.current_base / 1048576) > heapDumpMbThreshold;
      }
      Logger.info('memwatch stats', { ...stats, heapDumpEnabled: memoryMonitoringSettings.heapdump.enabled, heapDumpTriggered });

      if (heapDumpTriggered) {
        heapdump.writeSnapshot(`./heapdump-stats-${Date.now()}.heapsnapshot`);
        heapDumpMbThreshold += 100;
      }
    });
  }

  if (memoryMonitoringSettings.leak.enabled) {
    memwatch.on('leak', (info) => {
      Logger.info('memwatch leak', info);
    });
  } */

  if (CDN_URL.trim()) {
    // Add CDN
    BrowserPolicy.content.disallowEval();
    BrowserPolicy.content.allowInlineScripts();
    BrowserPolicy.content.allowInlineStyles();
    BrowserPolicy.content.allowImageDataUrl(CDN_URL);
    BrowserPolicy.content.allowFontDataUrl(CDN_URL);
    BrowserPolicy.content.allowOriginForAll(CDN_URL);
    WebAppInternals.setBundledJsCssPrefix(CDN_URL + APP_CONFIG.basename);

    const fontRegExp = /\.(eot|ttf|otf|woff|woff2)$/;

    WebApp.rawConnectHandlers.use('/', (req, res, next) => {
      if (fontRegExp.test(req._parsedUrl.pathname)) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Origin');
        res.setHeader('Pragma', 'public');
        res.setHeader('Cache-Control', '"public"');
      }
      return next();
    });
  }

  setMinBrowserVersions();

  Meteor.setInterval(() => {
    const currentTime = Date.now();
    Logger.info('Checking for inactive users');
    const users = Users.find({
      connectionStatus: 'online',
      clientType: 'HTML5',
      lastPing: {
        $lt: (currentTime - INTERVAL_TIME), // get user who has not pinged in the last 10 seconds
      },
      loginTime: {
        $lt: (currentTime - INTERVAL_TIME),
      },
    }).fetch();
    if (!users.length) return Logger.info('No inactive users');
    Logger.info('Removing inactive users');
    users.forEach((user) => {
      Logger.info(`Detected inactive user, userId:${user.userId}, meetingId:${user.meetingId}`);
      user.requesterUserId = user.userId;
      return userLeaving(user, user.userId, user.connectionId);
    });
    return Logger.info('All inactive user have been removed');
  }, INTERVAL_TIME);

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
  const override = APP_CONFIG.defaultSettings.application.overrideLocale;
  const browserLocale = override ? override.split(/[-_]/g) : req.query.locale.split(/[-_]/g);
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
      userName: reqUserName,
      comment,
      rating,
    } = body;

    check(meetingId, String);
    check(userId, String);
    check(authToken, String);
    check(reqUserName, String);
    check(comment, String);
    check(rating, Number);

    const user = Users.findOne({
      meetingId,
      userId,
      connectionStatus: 'offline',
      authToken,
    });

    if (!user) {
      Logger.warn('Couldn\'t find user for feedback');
    }

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));

    body.userName = user ? user.name : `[unconfirmed] ${reqUserName}`;

    const feedback = {
      ...body,
    };
    Logger.info('FEEDBACK LOG:', feedback);
  }));
});

WebApp.connectHandlers.use('/useragent', (req, res) => {
  const userAgent = req.headers['user-agent'];
  let response = 'No user agent found in header';
  if (userAgent) {
    response = lookupUserAgent(userAgent).toString();
  }

  Logger.info(`The requesting user agent is ${response}`);

  // res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(response);
});

export const eventEmitter = Redis.emitter;

export const redisPubSub = Redis;
