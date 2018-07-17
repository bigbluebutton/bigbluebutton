/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const rid = require('readable-id');
const User = require('./User');
const C = require('../constants/Constants.js');
const isError = require('../utils/util').isError;
const Logger = require('../../../utils/Logger');

module.exports = class User {
  constructor(roomId, type, userAgentString = C.STRING.ANONYMOUS) {
    this.roomId = roomId;
    this.id = rid();
    this.userAgentString = userAgentString;
  }

  _handleError (error) {
    let { message, code, stack, data, details } = error;

    if (code == null) {
      ({ code, message } = C.ERROR.MEDIA_GENERIC_ERROR);
    }
    else {
      ({ code, message } = error);
    }

    if (!isError(error)) {
      error = new Error(message);
    }

    error.code = code;
    error.message = message;
    error.stack = stack

    if (details) {
      error.details = details;
    }
    else {
      error.details = message;
    }

    Logger.trace("[User] SFU User received an error", error.code, error.message);
    Logger.trace(error.stack);

    return error;
  }
}
