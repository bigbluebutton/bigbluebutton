"use strict";

const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');
const EventEmitter = require('events').EventEmitter;

module.exports = class BaseProvider extends EventEmitter {
  constructor () {
    super();
  }

  _handleError (logPrefix, error) {
    Logger.debug(logPrefix, "Handling error", error.code, error.message);
    Logger.trace(logPrefix, error.stack);
  }
};

