import { exec } from 'child_process';
import { Meteor } from 'meteor/meteor';
import Langmap from 'langmap';
import fs from 'fs';
import Users from '/imports/api/users';
import './settings';
import { lookup as lookupUserAgent } from 'useragent';
import { check } from 'meteor/check';
import Jssha from 'jssha';
import Logger, { logTransports, avaibleLevels } from './logger';

const AVAILABLE_LOCALES = fs.readdirSync('assets/app/locales');

let secretKey = null;

const getSecretKeyFromServer = async () => {
  if (secretKey) return secretKey;
  const secretKeyServer = await new Promise((resolve, reject) => {
    exec('bbb-conf --secret', (err, stdout) => {
      if (err) {
        Logger.error("Error: Wasn't possible get the secret key");
        return reject(err);
      }

      const lines = stdout.split(/\r\n|\r|\n/);
      const secretKeyLine = lines.filter(value => value.toLowerCase().includes('secret: '))[0];
      const secretKeyString = secretKeyLine.replace('Secret: ', '').trim();
      return resolve(secretKeyString);
    });
  });
  secretKey = secretKeyServer;
  return secretKey;
};

const generatechecksum = async (...args) => {
  const argumentString = args.reduce((acc, cv) => acc + cv, '');
  const shaObject = new Jssha('SHA-256', 'TEXT');
  const serverSecretKey = await getSecretKeyFromServer();
  Logger.info(`${serverSecretKey}-${argumentString}`);
  shaObject.update(`${serverSecretKey}${argumentString}`);
  const generatedKey = shaObject.getHash('HEX');
  return generatedKey;
};

WebApp.connectHandlers.use('/setLogLevel', async (req, res) => {
  const { query } = req;
  const { level: paramLevel, checksum: paramCheckSum } = query;

  const checksum = await generatechecksum(paramLevel);

  let response = {};

  if (checksum !== paramCheckSum) {
    response = {
      error: 'The checksum is wrong',
    };
    Logger.error(`The checksum is wrong, the expected checksum is ${checksum}`);
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(403);
    res.end(JSON.stringify(response));
    return;
  }

  if (avaibleLevels.includes(paramLevel.toLowerCase())) {
    logTransports.console.level = paramLevel;
    response = {
      settedLevel: paramLevel,
    };
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
  } else {
    response = {
      error: 'Level not accepted, please verify trace levels',
      levels: avaibleLevels,
    };

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(406);
  }
  res.end(JSON.stringify(response));
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
