"use strict";

const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');
const EventEmitter = require('events').EventEmitter;
const { errors } = require('../base/errors');

module.exports = class BaseProvider extends EventEmitter {
  constructor () {
    super();
    this.sfuApp = "base";
  }

  _handleError (logPrefix, error, role, endpointId) {
    if (this._validateErrorMessage(error)) {
      return error;
    }

    const { code } = error;
    const reason = errors[code];

    if (reason == null) {
      return;
    }

    error.message = reason;

    Logger.debug(logPrefix, "Handling error", error.code, error.message);
    Logger.trace(logPrefix, error.stack);

    return this._assembleErrorMessage(error, role, endpointId);
  }

  _assembleErrorMessage (error, role, endpointId) {
    return {
      type: this.sfuApp,
      id: 'error',
      role,
      endpointId,
      code: error.code,
      reason: error.message,
    };
  }

  _validateErrorMessage (error) {
    const {
      type = null,
      id = null,
      role = null,
      endpointId = null,
      code = null,
      reason = null,
    } = error;
    return type && id && role && endpointId && code && reason;
  }
};
