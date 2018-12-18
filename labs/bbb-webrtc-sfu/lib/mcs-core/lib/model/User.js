/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const rid = require('readable-id');
const User = require('./User');
const C = require('../constants/Constants.js');
const Logger = require('../../../utils/Logger');
const { handleError } = require('../utils/util');
const LOG_PREFIX = "[mcs-user]";

module.exports = class User {
  constructor(roomId, type, userAgentString = C.STRING.ANONYMOUS) {
    this.roomId = roomId;
    this.id = rid();
    this.userAgentString = userAgentString;
  }

  _handleError (error) {
    return handleError(LOG_PREFIX, error);
  }
}
