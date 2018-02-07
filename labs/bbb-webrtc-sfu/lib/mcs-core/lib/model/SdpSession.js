/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const C = require('../constants/Constants');
const SdpWrapper = require('../utils/SdpWrapper');
const rid = require('readable-id');
const EventEmitter = require('events').EventEmitter;
const Kurento = require('../adapters/kurento');
const Freeswitch = require('../adapters/freeswitch/freeswitch');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const Logger = require('../../../utils/Logger');

module.exports = class SdpSession extends EventEmitter {
  constructor(
      emitter,
      sdp = null,
      room,
      type = 'WebRtcEndpoint',
      adapter = C.STRING.KURENTO,
      name = C.STRING.DEFAULT_NAME
    ) {

    super();
    this.id = rid();
    this.room = room;
    this.emitter = emitter;
    this._status = C.STATUS.STOPPED;
    this._type = type;
    this._name = name;
    // {SdpWrapper} SdpWrapper
    this._sdp;
    if (sdp && type) {
      this.setSdp(sdp, type);
    }
    this._mediaElement;
    this.subscribedSessions = [];
    this._adapter = adapter;
    this._MediaServer = SdpSession.getAdapter(adapter);
  }

  async setSdp (sdp, type) {
    this._sdp = new SdpWrapper(sdp, type);
    await this._sdp.processSdp();
  }

  async start (sdpId) {
    this._status = C.STATUS.STARTING;
    Logger.info("[mcs-sdp-session] Starting new SDP session", this.id, "in room", this.room );

    try {
      const client = await this._MediaServer.init();
      this._mediaElement = await this._MediaServer.createMediaElement(this.room, this._type, {name: this._name});
      this._MediaServer.trackMediaState(this._mediaElement, this._type);

      this._MediaServer.on(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this._mediaElement, (event) => {
        setTimeout(() => {
          event.id = this.id;
          this.emitter.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+this.id, event);
        }, 50);
      });

      const answer = await this._MediaServer.processOffer(this._mediaElement, this._sdp.getPlainSdp(), {name: this._name});

      if (this._type === 'WebRtcEndpoint') {
        this._MediaServer.gatherCandidates(this._mediaElement);
      }

      Logger.debug("[mcs-sdp-session] SDP session started with element ID", this._mediaElement);

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
      await this._MediaServer.stop(this.room, this._mediaElement);
      this._status = C.STATUS.STOPPED;
      Logger.info("[mcs-sdp-session] Session ", this.id, " is going to stop...");
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
  async connect (sinkSession) {
    let sinkId = sinkSession._mediaElement;
    try {
      Logger.info("[mcs-sdp-session] Connecting " + this._mediaElement + " => " + sinkId);
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

  static getAdapter (adapter) {
    let obj = null;

    Logger.info("[SdpSession] Session is using the", adapter, "adapter");

    switch (adapter) {
      case C.STRING.KURENTO:
        obj = new Kurento(kurentoUrl);
        break;
      case C.STRING.FREESWITCH:
        obj = new Freeswitch();
        break;
      default: Logger.warn("[SdpSession] Invalid adapter", this.adapter);
    }

    return obj;
  }

  handleError (err) {
    Logger.error("[mcs-sdp-session] SFU SDP Session received an error", err);
    this._status = C.STATUS.STOPPED;
  }
}
