/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const rid = require('readable-id');
const User = require('./User');
const C = require('../constants/Constants.js');

module.exports = class User {
  constructor(roomId, type, userAgentString = C.STRING.ANONYMOUS) {
    this.roomId = roomId;
    this.id = rid();
    this.userAgentString = userAgentString;
  }
}
