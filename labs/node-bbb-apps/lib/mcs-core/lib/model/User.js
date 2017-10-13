/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const uuidv4 = require('uuid/v4');
const User = require('./User');
const C = require('../constants/Constants.js');

module.exports = class User {
  constructor(roomId, type, userAgentString = C.STRING.ANONYMOUS) {
    this.roomId = roomId;
    this.id = uuidv4();
    this.userAgentString = userAgentString;
  }
}
