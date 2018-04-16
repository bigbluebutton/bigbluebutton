/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const User = require('./User');
const C = require('../constants/Constants');
const SdpWrapper = require('../utils/SdpWrapper');
const SdpSession = require('../model/SdpSession');
const RecordingSession = require('../model/RecordingSession');
const UriSession = require('../model/UriSession');
const Logger = require('../../../utils/Logger');
const isError = require('../utils/util').isError;

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
      err = this.handleError(err);
      Promise.reject(err);
    }
  }

  addSdp (sdp, type) {
    // TODO switch from type to children SdpSessions (WebRTC|SDP)
    let session = new SdpSession(this.emitter, sdp, this.roomId, type);
    this.emitter.emit(C.EVENT.NEW_SESSION+this.id, session.id);
    session.emitter.on(C.EVENT.MEDIA_SESSION_STOPPED, (sessId) => {
      if (sessId === session.id) {
        Logger.info("[mcs-sfu-user] Session ", sessId, "stopped, cleaning it...");
        this._mediaSessions[sessId] = null;
      }
    });

    if (typeof this._mediaSessions[session.id] == 'undefined' ||
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session;
    Logger.info("[mcs-sfu-user] Added new SDP session", session.id, "to user", this.id);

    return session;
  }

  addRecording (recordingName) {
    let session = new RecordingSession(this.emitter, this.roomId, this.recordingId);
    this.emitter.emit(C.EVENT.NEW_SESSION+this.id, session.id);

    session.on("SESSION_STOPPED", (sessId) => {
      Logger.info("[mcs-sfu-user] Recording session stopped.");
      if (sessId === session.id) {
        this._mediaSessions[sessId] = null;
      }
    });

    if (typeof this._mediaSessions[session.id] == 'undefined' ||
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session;
    Logger.info("[mcs-sfu-user] Added new recording session", session.id, "to user", this.id);

    return session;
  }


  async startSession (sessionId) {
    let session = this._mediaSessions[sessionId];

    try {
      const mediaElement = await session.start();
      const answer = await session.processDescriptor();
      return Promise.resolve(answer);
    }
    catch (err) {
      err = this.handleError(err);
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
      err = this.handleError(err);
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
      err = this.handleError(err);
      Promise.reject(err);
    }
  }

  async unsubscribe (mediaId) {
    try {
      await this.stopSession(mediaId);
      Promise.resolve(mediaId);
    }
    catch (err) {
      err = this.handleError(err);
      Promise.reject(err);
    }
  }

  async unpublish (mediaId) {
    try {
      await this.stopSession(mediaId);
      Promise.resolve();
    }
    catch (err) {
      err = this.handleError(err);
      Promise.reject(err);
    }
  }

  async stopSession (sessionId) {
    Logger.info("[mcs-sfu-user] Stopping session => " + sessionId);
    let session = this._mediaSessions[sessionId];

    try {
      if (session) {
        await session.stop();
        delete this._mediaSessions[sessionId];
      }
      return Promise.resolve();
    }
    catch (err) {
      err = this.handleError(err);
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
        err = this.handleError(err);
        return Promise.reject(err);
      }
    }
    else {
      return Promise.reject(new Error("[mcs-sfu-user] Source session " + sourceId + " not found"));
    }
  }

  async leave () {
    const sessions = Object.keys(this._mediaSessions);
    let stopProcedures = [];
    Logger.info("[mcs-sfu-user] User sessions will be killed");

    try {
      for (let i = 0; i < sessions.length; i++) {
        stopProcedures.push(this.stopSession(sessions[i]));
      }

      return Promise.all(stopProcedures);
    }
    catch (err) {
      err = this.handleError(err);
      Promise.reject(err);
    }
  }

  handleError (error) {
    Logger.error("[mcs-sfu-user] SFU User received error", error);
    // Checking if the error needs to be wrapped into a JS Error instance
    if (isError(error)) {
      error = new Error(error);
    }
    this._status = C.STATUS.STOPPED;
    return error;
  }
}
