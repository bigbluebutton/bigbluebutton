/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const C = require('../constants/Constants');
const rid = require('readable-id');
const EventEmitter = require('events').EventEmitter;
const MediaServer = require('../media/media-server');
const Logger = require('../../../utils/Logger');

module.exports = class UriSession extends EventEmitter {
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

  async start () {
    this._status = C.STATUS.STARTING;
    try {
      const mediaElement = await MediaServer.createMediaElement(this.id, C.MEDIA_TYPE.URI);
      await MediaServer.play(this.id);
      this._status = C.STATUS.STARTED;
      return Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      return Promise.reject(err);
    }
  }

  // TODO move to parent Session
  async stop () {
    this._status = C.STATUS.STOPPING;
    try {
      await MediaServer.stop(this.id);
      this._status = C.STATUS.STOPPED;
      return Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      return Promise.reject(err);
    }
  }

  // TODO move to parent Session
  async connect (sinkId) {
    try {
      await MediaServer.connect(this.id, sinkId);
      return Promise.resolve()
    }
    catch (err) {
      this.handleError(err);
      return Promise.reject(err);
    }
  }

  handleError (err) {
    Logger.error(err);
    this._status = C.STATUS.STOPPED;
  }
}
