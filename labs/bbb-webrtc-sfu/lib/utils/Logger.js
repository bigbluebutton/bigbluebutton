'use strict';

const Winston = require('winston');
const Logger = new Winston.Logger();
const config = require('config');
const path = require('path');
Winston.transports.DailyRotateFile = require('winston-daily-rotate-file');

const LOG_CONFIG = config.get('log') || {};
const { level } = LOG_CONFIG;
let filename = LOG_CONFIG.filename;

Logger.configure({
  levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4 },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    verbose: 'cyan',
    debug: 'magenta',
  },
});

Logger.add(Winston.transports.Console, {
  timestamp:true,
  prettyPrint: false,
  humanReadableUnhandledException: true,
  colorize: true,
  handleExceptions: false,
  silent: false,
  stringify: (obj) => JSON.stringify(obj),
  level,
});


if (filename) {
  Logger.add(Winston.transports.DailyRotateFile, {
    filename,
    prettyPrint: true,
    datePattern: '.yyyy-dd-MM',
    prepend: false,
    stringify: (obj) => JSON.stringify(obj), // single lines
    level,
  });
}

module.exports = Logger;
