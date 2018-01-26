/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const User = require('./User');
const C = require('../constants/Constants');
const SdpWrapper = require('../utils/SdpWrapper');
const SdpSession = require('../model/SdpSession');
const UriSession = require('../model/UriSession');
const Logger = require('../../../utils/Logger');

module.exports = class SfuUser extends User {
  constructor(_roomId, type, emitter, userAgentString = C.STRING.ANONYMOUS, sdp = null, uri = null) {
    super(_roomId);
    // {SdpWrapper} SdpWrapper
    this._sdp;
    this._mediaSessions = {}
    this.userAgentString;
    this.emitter = emitter;
    if (sdp) {
      this.addSdp(sdp);
    }
    if (uri) {
      this.addUri(uri);
    }
  }

  async addUri (uri, type) {
    // TODO switch from type to children UriSessions (RTSP|HTTP|etc)
    let session = new UriSession(uri, type);

    if (typeof this._mediaSessions[session.id] == 'undefined' || 
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session; 
    try {
      await this.startSession(session.id);
      Promise.resolve(session.id);
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  addSdp (sdp, type) {
    // TODO switch from type to children SdpSessions (WebRTC|SDP)
    let session = new SdpSession(this.emitter, sdp, this.roomId, type);
    this.emitter.emit(C.EVENT.NEW_SESSION+this.id, session.id);
    session.on("SESSION_STOPPED", (sessId) => {
      Logger.info("[mcs-sfu-user] Session ", sessId, "stopped, cleaning it...");
      if (sessId === session.id) {
        this._mediaSessions[sessId] = null;
      }
    });

    if (typeof this._mediaSessions[session.id] == 'undefined' || 
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session; 
    Logger.info("[mcs-sfu-user] Added SDP " + session.id);

    return session;
  }

  async startSession (sessionId) {
    Logger.info("[mcs-sfu-user] starting session " + sessionId);
    let session = this._mediaSessions[sessionId];
  
    try {
      const answer = await session.start();
      return Promise.resolve(answer);
    }
    catch (err) {
      this.handleError(err);
      return Promise.reject(err);
    }
  }

  async subscribe (sdp, type,  mediaId) {
    try {
      const session = await this.addSdp(sdp, type);
      await this.startSession(session.id);
      await this.connect(session.id, mediaId);
      Promise.resolve(session);
    } 
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  async publish (sdp, mediaId) {
    let session = await this.addSdp(sdp);
    try {
      await this.startSession(session.id);
      Promise.resolve();
    } 
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  async unsubscribe (mediaId) {
    try {
      await this.stopSession(mediaId);
      Promise.resolve();
    } 
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  async unpublish (mediaId) {
    try {
      await this.stopSession(mediaId);
      Promise.resolve();
    } 
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  async stopSession (sessionId) {
    Logger.info("[mcs-sfu-user] Stopping session => " + sessionId);
    let session = this._mediaSessions[sessionId];

    try {
      await session.stop();
      this._mediaSessions[sessionId] = null;
      return Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  async connect (sourceId, sinkId) {
    let session = this._mediaSessions[sourceId];
    if(session) {
      try {
        Logger.info("[mcs-sfu-user] Connecting sessions " + sourceId + "=>" + sinkId);
        await session.connect(sinkId);
        return Promise.resolve();
      }
      catch (err) {
        this.handleError(err);
        return Promise.reject(err);
      }
    }
    else {
      return Promise.reject(new Error("[mcs-sfu-user] Source session " + sourceId + " not found"));
    }
  }

  async leave () {
    let sessions = Object.keys(this._mediaSessions);
    Logger.info("[mcs-sfu-user] User sessions will be killed");

    try {
      for (var session in sessions) {
        await this.stopSession(sessions[session]);
      }

      return Promise.resolve(sessions);
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  handleError (err) {
    Logger.error("[mcs-sfu-user] SFU User received error", err);
    this._status = C.STATUS.STOPPED;
  }
}
