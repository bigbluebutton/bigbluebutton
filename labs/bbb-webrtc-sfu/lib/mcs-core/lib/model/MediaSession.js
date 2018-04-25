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
const isError = require('../utils/util').isError;

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
      this._status = C.STATUS.STARTED;
      this._MediaServer.trackMediaState(this._mediaElement, this._type);
      this._MediaServer.on(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this._mediaElement, (event) => {
        setTimeout(() => {
          event.id = this.id;
          this.emitter.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this.id, event);
        }, 50);
      });

      this._MediaServer.on(C.ERROR.MEDIA_SERVER_OFFLINE, () => {
          let event = {};
          event.eventTag = C.ERROR.MEDIA_SERVER_OFFLINE;
          event.id = this.id;
          this.emitter.emit(C.EVENT.SERVER_STATE+this.id, event);
      });

      this._MediaServer.on(C.EVENT.MEDIA_SERVER_ONLINE, () => {
          let event = {};
          event.eventTag = C.EVENT.MEDIA_SERVER_ONLINE;
          event.id = this.id;
          this.emitter.emit(C.EVENT.SERVER_STATE+this.id);
      });

      return Promise.resolve(this._mediaElement);
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  async stop () {
    if (this._status === C.STATUS.STARTED) {
      this._status = C.STATUS.STOPPING;
      try {
        await this._MediaServer.stop(this.room, this._mediaElement);
        this._status = C.STATUS.STOPPED;
        Logger.info("[mcs-media-session] Session", this.id, "stopped with status", this._status);
        this.emitter.emit(C.EVENT.MEDIA_SESSION_STOPPED, this.id);
        return Promise.resolve();
      }
      catch (err) {
        err = this._handleError(err);
        return Promise.reject(err);
      }
    } else {
      return Promise.resolve();
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
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  addMediaEventListener (type, mediaId) {
    this._MediaServer.addMediaEventListener (type, mediaId);
  }

  _handleError (error) {
    Logger.error("[mcs-media-session] SFU MediaSession received an error", error);
    // Checking if the error needs to be wrapped into a JS Error instance
    if (!isError(error)) {
      error = new Error(error);
    }
    this._status = C.STATUS.STOPPED;
    return error;
  }
}
