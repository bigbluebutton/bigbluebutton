/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const C = require('../constants/Constants');
const SdpWrapper = require('../utils/SdpWrapper');
const uuidv4 = require('uuid/v4');
const EventEmitter = require('events').EventEmitter;
const MediaServer = require('../media/media-server');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');

module.exports = class SdpSession extends EventEmitter {
  constructor(emitter, sdp = null, room, type = 'WebRtcEndpoint') {
    super();
    this.id = uuidv4();
    this.room = room;
    this.emitter = emitter;
    this._status = C.STATUS.STOPPED;
    this._type = type;
    // {SdpWrapper} SdpWrapper
    this._sdp;
    if (sdp && type) {
      this.setSdp(sdp, type);
    }
    this._MediaServer = new MediaServer(kurentoUrl);
    this._mediaElement;
    this.subscribedSessions = [];
  }

  async setSdp (sdp, type) {
    this._sdp = new SdpWrapper(sdp, type);
    await this._sdp.processSdp();
  }

  async start (sdpId) {
    this._status = C.STATUS.STARTING;
    try {
      const client = await this._MediaServer.init();

      console.log("[SdpSession] start/cme");
      this._mediaElement = await this._MediaServer.createMediaElement(this.room, this._type);
      console.log("[SdpSession] start/po " + this._mediaElement);

      this._MediaServer.trackMediaState(this._mediaElement, this._type);
      this._MediaServer.on(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this._mediaElement, (event) => {
        setTimeout(() => {
          event.id = this.id;
          this.emitter.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this.id, event);
        }, 50);
      });

      const answer = await this._MediaServer.processOffer(this._mediaElement, this._sdp.getPlainSdp()); 

      if (this._type === 'WebRtcEndpoint') {
        this._MediaServer.gatherCandidates(this._mediaElement);
      }

      return Promise.resolve(answer);
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
      await this._MediaServer.stop(this._mediaElement);
      this._status = C.STATUS.STOPPED;
      console.log("  [SdpSession] Session ", this.id, " is going to stop...");
      this.emit('SESSION_STOPPED', this.id);
      Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }


  // TODO move to parent Session
  // TODO handle connection type
  async connect (sinkId) {
    try {
      console.log("  [SdpSession] Connecting " + this._mediaElement + " => " + sinkId);
      await this._MediaServer.connect(this._mediaElement, sinkId, 'ALL');
      return Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      return Promise.reject(err);
    }
  }

  async addIceCandidate (candidate) {
    try {
      await this._MediaServer.addIceCandidate(this._mediaElement, candidate);
      Promise.resolve();
    }
    catch (err) {
      Promise.reject(err);
    }
  }

  addMediaEventListener (type, mediaId) {
    this._MediaServer.addMediaEventListener (type, mediaId);
  }

  handleError (err) {
    console.log(err);
    this._status = C.STATUS.STOPPED;
  }
}
