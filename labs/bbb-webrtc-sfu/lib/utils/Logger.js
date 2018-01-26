'use strict';

/**
 * @classdesc
 * Logger singleton for mcs-sip
 * @memberof mcs-sip
 */

const Winston = require('winston');
const Logger = new Winston.Logger();
const config = require('config');
const path = require('path');

const LOG_CONFIG = config.get('log') || {};

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
  stringify: (obj) => JSON.stringify(obj)
});

let filename = LOG_CONFIG.filename || path.join(process.env.PWD, 'mcs-sip.log');

if (filename) {
  Logger.add(Winston.transports.File, {
    filename,
    prettyPrint: true,
    timestamp:true,
    stringify: (obj) => JSON.stringify(obj), // single lines
    maxsize: LOG_CONFIG.maxSize || '100000000' // 100MB default
  });
}

Logger.transports.console.level = LOG_CONFIG.level;
Logger.transports.file.level = LOG_CONFIG.level;

module.exports = Logger;
