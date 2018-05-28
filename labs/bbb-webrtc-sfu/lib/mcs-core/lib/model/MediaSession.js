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
  constructor(emitter, room, type, options = {}) {
    this.id = rid();
    this.room = room;
    this.emitter = emitter;
    this._status = C.STATUS.STOPPED;
    this._type = type;
    this._MediaServer = new MediaServer(kurentoUrl);
    this._mediaElement;
    this.subscribedSessions = [];
    this._options = options;
    this.eventQueue = [];
  }

  async start () {
    this._status = C.STATUS.STARTING;
    try {
      const client = await this._MediaServer.init();

      this._mediaElement = await this._MediaServer.createMediaElement(this.room, this._type, this._options);

      Logger.info("[mcs-media-session] New media session", this.id, "in room", this.room, "started with media server endpoint", this._mediaElement);

      this._MediaServer.on(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this._mediaElement, (event) => {
        event.id = this.id;
        if (this._status !== C.STATUS.STARTED) {
          Logger.debug("[mcs-media-session] Media session", this.id, "queuing event", event);
          this.eventQueue.push(event);
        }
        else {
          this.emitter.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this.id, event);
        }
      });

      this._MediaServer.trackMediaState(this._mediaElement, this._type);

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
        await this._MediaServer.stop(this.room, this._type, this._mediaElement);
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
  async connect (sinkId, type = 'ALL') {
    try {
      Logger.info("[mcs-media-session] Connecting " + this._mediaElement + " => " + sinkId);
      await this._MediaServer.connect(this._mediaElement, sinkId, type);
      return Promise.resolve();
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  async disconnect (sinkId, type = 'ALL') {
    try {
      Logger.info("[mcs-media-session] Dis-connecting " + this._mediaElement + " => " + sinkId);
      await this._MediaServer.disconnect(this._mediaElement, sinkId, type);
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

  sessionStarted () {
    if (this._status === C.STATUS.STARTING) {
      this._status = C.STATUS.STARTED;
      // FIXME: ugly hack, gotta change the event model to a subscription-based
      // one to remove this - prlanzarin
      setTimeout(() => {
        this._flushEventQueue();
      }, 50);
      Logger.debug("[mcs-media-session] Session", this.id, "successfully started");
    }
  }

  _flushEventQueue () {
    Logger.debug("[mcs-media-session] Flushing session", this.id, "events queue");
    while (this.eventQueue.length) {
      let event = this.eventQueue.shift();
      this.emitter.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this.id, event);
    }
  }

  _handleError (error) {
    Logger.error("[mcs-media-session] SFU MediaSession received an error", error, error.stack);
    // Checking if the error needs to be wrapped into a JS Error instance
    if (!isError(error)) {
      error = new Error(error);
    }
    this._status = C.STATUS.STOPPED;
    return error;
  }
}
