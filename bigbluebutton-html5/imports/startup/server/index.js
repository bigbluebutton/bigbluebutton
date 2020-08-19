import { Meteor } from 'meteor/meteor';
import { WebAppInternals } from 'meteor/webapp';
import Users from '/imports/api/users';
import './settings';
import Logger from './logger';
import Redis from './redis';
import setMinBrowserVersions from './minBrowserVersion';
import userLeaving from '/imports/api/users/server/methods/userLeaving';
import './api';

const AVAILABLE_LOCALES = fs.readdirSync('assets/app/locales');
let avaibleLocalesNames = [];

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
      return userLeaving(user.meetingId, user.userId, user.connectionId);
    });
    return Logger.info('All inactive users have been removed');
  }, INTERVAL_TIME);

  Logger.warn(`SERVER STARTED.\nENV=${env},\nnodejs version=${process.version}\nCDN=${CDN_URL}\n`, APP_CONFIG);
});

export const eventEmitter = Redis.emitter;

export const redisPubSub = Redis;
