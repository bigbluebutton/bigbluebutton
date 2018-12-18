/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const C = require('../constants/Constants');
const rid = require('readable-id');
const EventEmitter = require('events').EventEmitter;
const MediaSession = require('./MediaSession');
const Logger = require('../../../utils/Logger');

module.exports = class UriSession extends MediaSession {
  constructor(uri = null) {
    super();
    this.id = rid();
    this._status = C.STATUS.STOPPED;
    this._uri;
    if (uri) {
      this.setUri(uri);
    }
  }

  setUri (uri) {
    this._uri = uri;
  }
}
