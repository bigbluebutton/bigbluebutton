/**
 * @classdesc
 * Model class for Recording
 */

'use strict'

const C = require('../constants/Constants');
const rid = require('readable-id');
const EventEmitter = require('events').EventEmitter;
const MediaServer = require('../media/media-server');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const Logger = require('../../../utils/Logger');

module.exports = class RecordingSession extends EventEmitter {
  constructor(emitter, room, recordingName) {
    super();
    this.id = rid();
    this.room = room;
    this.emitter = emitter;
    this._status = C.STATUS.STOPPED;
    this._type = 'RecorderEndpoint';
    this._MediaServer = new MediaServer(kurentoUrl);
    this._mediaElement;

    this.options = {
      mediaProfile: 'MP4_VIDEO_ONLY',
      uri: this.getRecordingPath(room, 'medium', recordingName),
      stopOnEndOfStream: true
    };

  }

  getRecordingPath (room, profile, recordingName) {
    const basePath = config.get('recordingBasePath');
    const timestamp = (new Date()).getTime();

    return `${basePath}/${room}/${profile}-${recordingName}-${timestamp}.mp4`;
  }

  async start () {
    this._status = C.STATUS.STARTING;
    try {
      const client = await this._MediaServer.init();

      Logger.info("[mcs-recording-session] Starting new Recording session", this.id);

      this._mediaElement = await this._MediaServer.createMediaElement(this.room, this._type, this.options);

      this._MediaServer.trackMediaState(this._mediaElement, this._type);

      this._MediaServer.on(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this._mediaElement, (event) => {
        setTimeout(() => {
          event.id = this.id;
          this.emitter.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this.id, event);
        }, 50);
      });

      const answer = await this._MediaServer.startRecording(this._mediaElement);

      return Promise.resolve(answer);
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
      Logger.info("[mcs-recording-session] Session ", this.id, " is going to stop...");
      this.emit('SESSION_STOPPED', this.id);
      Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  async connect (sinkId) {
    try {
      Logger.info("[mcs-recording-session] Connecting " + this._mediaElement + " => " + sinkId);
      await this._MediaServer.connect(this._mediaElement, sinkId, 'VIDEO');
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
    Logger.error("[mcs-recording-session] SFU Recording Session received an error", err);
    this._status = C.STATUS.STOPPED;
  }
}
