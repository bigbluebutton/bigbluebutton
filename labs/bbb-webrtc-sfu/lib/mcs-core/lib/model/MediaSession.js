/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const C = require('../constants/Constants');
const rid = require('readable-id');
const MediaServer = require('../media/media-server');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const Logger = require('../../../utils/Logger');

module.exports = class MediaSession {
  constructor(emitter, room, type) {
    this.id = rid();
    this.room = room;
    this.emitter = emitter;
    this._status = C.STATUS.STOPPED;
    this._type = type;
    this._MediaServer = new MediaServer(kurentoUrl);
    this._mediaElement;
    this.subscribedSessions = [];
  }

  async start () {
    this._status = C.STATUS.STARTING;
    try {
      const client = await this._MediaServer.init();

      Logger.info("[mcs-media-session] Starting new media session", this.id, "in room", this.room );
      this._mediaElement = await this._MediaServer.createMediaElement(this.room, this._type);
      this._MediaServer.trackMediaState(this._mediaElement, this._type);
      this._MediaServer.on(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this._mediaElement, (event) => {
        setTimeout(() => {
          event.id = this.id;
          this.emitter.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this.id, event);
        }, 50);
      });

      return Promise.resolve(this._mediaElement);
    }
    catch (err) {
      this.handleError(err);
      return Promise.reject(err);
    }
  }

  async stop () {
    this._status = C.STATUS.STOPPING;
    try {
      await this._MediaServer.stop(this.room, this._mediaElement);
      this._status = C.STATUS.STOPPED;
      Logger.info("[mcs-media-session] Session ", this.id, " is going to stop...");
      this.emitter.emit(C.EVENT.MEDIA_SESSION_STOPPED, this.id);
      Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  // TODO handle connection type
  async connect (sinkId) {
    try {
      Logger.info("[mcs-media-session] Connecting " + this._mediaElement + " => " + sinkId);
      await this._MediaServer.connect(this._mediaElement, sinkId, 'ALL');
      return Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      return Promise.reject(err);
    }
  }

  addMediaEventListener (type, mediaId) {
    this._MediaServer.addMediaEventListener (type, mediaId);
  }

  handleError (err) {
    Logger.error("[mcs-media-session] SFU MediaSession received an error", err);
    this._status = C.STATUS.STOPPED;
  }
}
