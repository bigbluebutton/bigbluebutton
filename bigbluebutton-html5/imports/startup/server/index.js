import { Meteor } from 'meteor/meteor';
import { WebAppInternals } from 'meteor/webapp';
import Langmap from 'langmap';
import fs from 'fs';
import path from 'path';
import heapdump from 'heapdump';
import Users from '/imports/api/users';
import './settings';
import { lookup as lookupUserAgent } from 'useragent';
import { check } from 'meteor/check';
import memwatch from 'memwatch-next';
import Logger from './logger';
import Redis from './redis';
import setMinBrowserVersions from './minBrowserVersion';
import userLeaving from '/imports/api/users/server/methods/userLeaving';

const AVAILABLE_LOCALES = fs.readdirSync('assets/app/locales');

process.on('uncaughtException', (err) => {
  Logger.error(`uncaughtException: ${err}`);
  process.exit(1);
});

Meteor.startup(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  const INTERVAL_IN_SETTINGS = (Meteor.settings.public.pingPong.clearUsersInSeconds) * 1000;
  const INTERVAL_TIME = INTERVAL_IN_SETTINGS < 10000 ? 10000 : INTERVAL_IN_SETTINGS;
  const env = Meteor.isDevelopment ? 'development' : 'production';
  const CDN_URL = APP_CONFIG.cdn;
  let heapDumpMbThreshold = 100;

  const { customHeartbeat } = APP_CONFIG;

  if (customHeartbeat) {
    Logger.warn('Custom heartbeat functions are enabled');
    // https://github.com/sockjs/sockjs-node/blob/1ef08901f045aae7b4df0f91ef598d7a11e82897/lib/transport/websocket.js#L74-L82
    const newHeartbeat = function heartbeat() {
      const currentTime = new Date().getTime();

      // Skipping heartbeat, because websocket is sending data
      if (currentTime - this.ws.lastSentFrameTimestamp < 10000) {
        try {
          Logger.info('Skipping heartbeat, because websocket is sending data', {
            currentTime,
            lastSentFrameTimestamp: this.ws.lastSentFrameTimestamp,
            userId: this.session.connection._meteorSession.userId,
          });
          return;
        } catch (err) {
          Logger.error(`Skipping heartbeat error: ${err}`);
        }
      }

      const supportsHeartbeats = this.ws.ping(null, () => clearTimeout(this.hto_ref));
      if (supportsHeartbeats) {
        this.hto_ref = setTimeout(() => {
          try {
            Logger.info('Heartbeat timeout', { userId: this.session.connection._meteorSession.userId, sentAt: currentTime, now: new Date().getTime() });
          } catch (err) {
            Logger.error(`Heartbeat timeout error: ${err}`);
          }
        }, Meteor.server.options.heartbeatTimeout);
      } else {
        Logger.error('Unexpected error supportsHeartbeats=false');
      }
    };

    // https://github.com/davhani/hagty/blob/6a5c78e9ae5a5e4ade03e747fb4cc8ea2df4be0c/faye-websocket/lib/faye/websocket/api.js#L84-L88
    const newSend = function send(data) {
      try {
        this.lastSentFrameTimestamp = new Date().getTime();

        if (this.meteorHeartbeat) {
          // Call https://github.com/meteor/meteor/blob/1e7e56eec8414093cd0c1c70750b894069fc972a/packages/ddp-common/heartbeat.js#L80-L88
          this.meteorHeartbeat._seenPacket = true;
          if (this.meteorHeartbeat._heartbeatTimeoutHandle) {
            this.meteorHeartbeat._clearHeartbeatTimeoutTimer();
          }
        }

        if (this.readyState > 1/* API.OPEN = 1 */) return false;
        if (!(data instanceof Buffer)) data = String(data);
        return this._driver.messages.write(data);
      } catch (err) {
        console.error('Error on send data', err);
        return false;
      }
    };

    Meteor.setInterval(() => {
      for (const session of Meteor.server.sessions.values()) {
        const { socket } = session;
        const recv = socket._session.recv;

        if (session.bbbFixApplied || !recv || !recv.ws) {
          continue;
        }

        recv.ws.meteorHeartbeat = session.heartbeat;
        recv.__proto__.heartbeat = newHeartbeat;
        recv.ws.__proto__.send = newSend;
        session.bbbFixApplied = true;
      }
    }, 5000);
  }

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
  }

  if (memoryMonitoringSettings.heapdump.enabled) {
    const { heapdumpFolderPath, heapdumpIntervalMs } = memoryMonitoringSettings.heapdump;
    Meteor.setInterval(() => {
      heapdump.writeSnapshot(path.join(heapdumpFolderPath, `${new Date().toISOString()}.heapsnapshot`));
      Logger.info('Heapsnapshot file successfully written');
    }, heapdumpIntervalMs);
  }

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
      return userLeaving(user.meetingId, user.userId, user.connectionId);
    });
    return Logger.info('All inactive users have been removed');
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
  const browserLocale = override && req.query.init === 'true'
    ? override.split(/[-_]/g) : req.query.locale.split(/[-_]/g);

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
