'use strict'

const config = require('config');
const C = require('../constants/Constants');
const Logger = require('../../../utils/Logger');
// Model
const SfuUser = require('../model/SfuUser');
const Room = require('../model/Room.js');
const isError = require('../utils/util').isError;

/* PUBLIC ELEMENTS */

let instance = null;

module.exports = class MediaController {
  constructor(emitter) {
    if (!instance) {
      this.emitter = emitter;
      this._rooms = {};
      this._users = {};
      this._mediaSessions = {};
      instance = this;
    }

    return instance;
  }

  start (_kurentoClient, _kurentoToken, callback) {
    // TODO
    return callback(null);
  }

  stop (callback) {
    // TODO
  }

  getRoom (roomId) {
    return this._rooms[roomId];
  }

  async join (roomId, type, params) {
    Logger.info("[mcs-controller] Join room => " + roomId + ' as ' + type);
    try {
      let session;
      const room = await this.createRoomMCS(roomId);
      this._rooms[roomId] = room;
      const user = await this.createUserMCS(roomId, type, params);
      room.setUser(user.id);
      this._users[user.id] = user;
      if (params.sdp) {
        session = user.addSdp(params.sdp);
      }
      if (params.uri) {
        session = user.addUri(params.sdp);
      }

      Logger.info("[mcs-controller] Resolving user " + user.id);
      return Promise.resolve(user.id);
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  async leave (roomId, userId) {
    try {
      Logger.info("[mcs-controller] User => " + userId + " wants to leave ");
      const room = this.getRoom(roomId);
      const user = this.getUserMCS(userId);

      if (!user || !room) {
        return Promise.resolve();
      }

      const killedMedias = await user.leave();

      killedMedias.forEach((mediaId) => {
        delete this._mediaSessions[killedMedias[mediaId]];
      });

      room.destroyUser(user.id);
      delete this._users[user.id];

      return Promise.resolve();
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  async publishnsubscribe (userId, sourceId, sdp, params) {
    Logger.info("[mcs-controller] PublishAndSubscribe from user", userId, "to source", sourceId);
    Logger.debug("[mcs-controler] PublishAndSubscribe descriptor is", params.descriptor);

    try {
      const type = params.type;
      const user = this.getUserMCS(userId);
      const userId = user.id;
      const session = user.addSdp(sdp, type);
      const sessionId = session.id;

      if (typeof this._mediaSessions[session.id] == 'undefined' ||
          !this._mediaSessions[session.id]) {
        this._mediaSessions[session.id] = {};
      }

      this._mediaSessions[session.id] = session;

      const answer = await user.startSession(session.id);
      await user.connect(sourceId, session.id);

      Logger.info("[mcs-controller] PublishAndSubscribe return a SDP session with ID", session.id);
      return Promise.resolve({userId, sessionId});
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  async publish (userId, roomId, type, params) {
    Logger.info("[mcs-controller] Publish from user", userId, "to room", roomId);
    Logger.debug("[mcs-controler] Publish descriptor is", params.descriptor);
    let session;
    let answer;

    try {

      const user = await this.getUserMCS(userId);

      Logger.info("[mcs-controller] Fetched user", user.id);

      switch (type) {
        case "RtpEndpoint":
        case "WebRtcEndpoint":
          session = user.addSdp(params.descriptor, type);
          answer = await user.startSession(session.id);
          break;
        case "URI":
          session = user.addUri(params.descriptor, type);

          answer = await user.startSession(session.id);
          break;

        default: return Promise.reject(new Error("[mcs-controller] Invalid media type"));
      }
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }

    if (typeof this._mediaSessions[session.id] == 'undefined' ||
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }

    this._mediaSessions[session.id] = session;
    let sessionId = session.id;

    return Promise.resolve({answer, sessionId});
  }

  async subscribe (userId, sourceId, type, params) {
    Logger.info("[mcs-controller] Subscribe from user", userId, "to source", sourceId);
    Logger.debug("[mcs-controler] Subscribe descriptor is", params.descriptor);

    let session;
    let answer;
    const sourceSession = this._mediaSessions[sourceId];

    if (typeof sourceSession === 'undefined') {
      return Promise.reject(new Error("[mcs-controller] Media session", sourceId, "was not found"));
    }

    try {
      const user = await this.getUserMCS(userId);

      Logger.info("[mcs-controller] Fetched user", user.id);

      switch (type) {
        case "RtpEndpoint":
        case "WebRtcEndpoint":
          session = user.addSdp(params.descriptor, type);

          answer = await user.startSession(session.id);
          await sourceSession.connect(session._mediaElement);
          sourceSession.subscribedSessions.push(session.id);
          Logger.info("[mcs-controller] Updated", sourceSession.id,  "subscribers list to", sourceSession.subscribedSessions);
          break;
        case "URI":
          session = user.addUri(params.descriptor, type);
          answer = await user.startSession(session.id);
          await sourceSession.connect(session._mediaElement);

          break;

        default: return Promise.reject(new Error("[mcs-controller] Invalid media type"));
      }
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }

    if (typeof this._mediaSessions[session.id] == 'undefined' ||
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }

    this._mediaSessions[session.id] = session;
    const sessionId = session.id;

    return Promise.resolve({answer, sessionId});
  }

  async unpublish (userId, mediaId) {
    try {
      const user = this.getUserMCS(userId);
      if (user) {
        const answer = await user.unpublish(mediaId);
        this._mediaSessions[mediaId] = null;
      }
      return Promise.resolve(answer);
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  async unsubscribe (userId, mediaId) {
    try {
      const user = this.getUserMCS(userId);
      if (user) {
        const answer = await user.unsubscribe(mediaId);
        this._mediaSessions[mediaId] = null;
      }
      return Promise.resolve();
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  async startRecording (userId, sourceId, recordingName) {
    Logger.info("[mcs-controller] startRecording ", sourceId);

    const user = await this.getUserMCS(userId);

    let session;
    let answer;
    let sourceSession = this._mediaSessions[sourceId];

    if (typeof sourceSession === 'undefined') {
      return Promise.reject(new Error("[mcs-controller] Media session", sourceId, "was not found"));
    }

    try {
      session = await user.addRecording(recordingName);

      answer = await user.startSession(session.id);
      await sourceSession.connect(session._mediaElement);

      sourceSession.subscribedSessions.push(session.id);
      return Promise.resolve(answer);
    }
    catch (err) {
      Logger.error("[mcs-controller] Subscribe failed with an error", err);
      return Promise.reject(err);
    }
  }

  async addIceCandidate (mediaId, candidate) {
    const session = this._mediaSessions[mediaId];
    if (!session) {
      return Promise.reject(new Error("[mcs-controller] Media session " + mediaId + " was not found"));
    }
    try {
      const ack = await session.addIceCandidate(candidate);
      return Promise.resolve(ack);
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(err);
    }
  }

  /**
   * Creates an empty {Room} room and indexes it
   * @param {String} roomId
   */
  async createRoomMCS (roomId)  {
    let self = this;

    Logger.info("[mcs-controller] Creating new room with ID", roomId);

    if(!self._rooms[roomId]) {
      self._rooms[roomId] = new Room(roomId);
    }

    return Promise.resolve(self._rooms[roomId]);
  }

  /**
   * Creates an {User} of type @type
   * @param {String} roomId
   */
  createUserMCS (roomId, type, params)  {
    let self = this;
    let user;
    Logger.info("[mcs-controller] Creating a new", type, "user at room", roomId);

    switch (type) {
      case C.USERS.SFU:
        user  = new SfuUser(roomId, type, this.emitter, params.userAgentString, params.sdp);
        break;
      case C.USERS.MCU:
        Logger.warn("[mcs-controller] createUserMCS MCU TODO");
        break;
      default:
        Logger.warn("[mcs-controller] Unrecognized user type");
    }

    if(!self._users[user.id]) {
      self._users[user.id] = user;
    }

    return Promise.resolve(user);
  }

  getUserMCS (userId) {
    return this._users[userId];
  }

  _handleError (error) {
    Logger.error("[mcs-controller] Controller received error", error);
    // Checking if the error needs to be wrapped into a JS Error instance
    if (!isError(error)) {
      error = new Error(error);
    }
    return error;
  }
}
