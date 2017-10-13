'use strict'

var config = require('config');
var C = require('../constants/Constants');

// Model
var SfuUser = require('../model/SfuUser');
var Room = require('../model/Room.js');
var mediaServer = require('./media-server');


/* PRIVATE ELEMENTS */
/**
 * Deep copy a javascript Object
 * @param  {Object} object The object to be copied
 * @return {Object}        A deep copy of the given object
 */
function copy(object) {
  return JSON.parse(JSON.stringify(object));
}

function getPort(min_port, max_port) {
  return Math.floor((Math.random()*(max_port - min_port +1)+ min_port));
}

function getVideoPort() {
  return getPort(config.get('sip.min_video_port'), config.get('sip.max_video_port'));
}

/* PUBLIC ELEMENTS */

module.exports = class MediaController {
  constructor() {
    // Kurento
    this._rooms = {};
    this._users = {};
  }

  start (_kurentoClient, _kurentoToken, callback) {
    var self = this;
    return callback(null);
  }

  stop (callback) {
    var self = this;
    self.stopAllMedias(function (e) {
      if (e) {
        callback(e);
      }
      self._rooms = {};
    });
  }

  getVideoPort () {
    return getPort(config.get('sip.min_video_port'), config.get('sip.max_video_port'));
  }

  getRoom (roomId) {
    return this._rooms[roomdId];
  }

  async join (roomId, type, params) {
    console.log("[mcs] join");
    try {
      const room = await this.createRoomMCS(roomId);
      const user = await this.createUserMCS(roomId, type, params);
      let userId = user.id;
      room.setUser(user);
      if (params.sdp) {
        const sessionId = user.addSdp(params.sdp);
      }
      if (params.uri) {
        const sessionId = user.addUri(params.sdp);
      }
      console.log("[mcs] Resolving user " + userId);
      return Promise.resolve(userId);
    }
    catch (err) {
      console.log("[mcs] JOIN ERROR " + err);
      return Promise.reject(new Error(err));
    }
  }

  async publishnsubscribe (userId, sourceId, sdp, params) {
    console.log("[mcs] pns");
    let type = params.type;
    try {
      const user = await this.getUserMCS(userId);
      let userId = user.id;
      const sessionId = user.addSdp(sdp, type);
      const answer = await user.startSession(sessionId);
      await user.connect(sourceId, sessionId);
      console.log("[mcs] user with sdp session " + sessionId);
      console.log(user);
      return Promise.resolve({userId, sessionId});
    }
    catch (err) {
      console.log("[mcs] PUBLISHNSUBSCRIBE ERROR " + err);
      return Promise.reject(new Error(err));
    }
  }

  async publish (userId, roomId, type, params) {
    console.log("[mcs] publish");
    let mediaId;
    // TODO handle mediaType
    let mediaType = params.mediaType;
    let answer;

    try {
      const user = await this.getUserMCS(userId);

      switch (type) {
        case "SDP":
          mediaId = user.addSdp(params.descriptor, type);
          answer = await user.startSession(mediaId);
          break;
        case "URI":
          mediaId = user.addUri(params.descriptor, type);
          answer = await user.startSession(mediaId);
          break;

        default: return Promise.reject(new Error("[mcs] Invalid media type"));
      }
    }
    catch (err) {
      return Promise.reject(new Error(err));
    }
    console.log(user);
    return Promise.resolve({answer, mediaId});
  }

  async subscribe (userId, type, sourceId, params) {
    let mediaId;
    // TODO handle mediaType
    let mediaType = params.mediaType;

    try {
    const user = this.getUserMCS(userId);

      switch (type) {
        case "SDP":
          mediaId = user.addSdp(params.descriptor, type);
          await user.connect(sourceId, mediaId);
          const answer = await user.startSession(mediaId);
          break;
        case "URI":
          //TODO
          //mediaId = user.addUri(params.descriptor);
          break;

        default: return Promise.reject(new Error("[mcs] Invalid media type"));
      }
    }
    catch (err) {
      return Promise.reject(new Error(err));
    }

    return Promise.resolve({answer, mediaId});
  }


  async unpublish (userId, mediaId) {
    try {
      const user = this.getUserMCS(userId);
      const answer = await user.unpublish(mediaId);
      return Promise.resolve(answer);
    }
    catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  async unsubscribe (userId, mediaId) {
    try {
      const user = this.getUserMCS(userId);
      const answer = await user.unsubscribe(mediaId);
      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  /**
   * Creates an empty {Room} room and indexes it
   * @param {String} roomId
   */
  async createRoomMCS (roomId)  {
    var self = this;

    console.log("  [media] Creating new room with ID " + roomId);

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
    console.log("  [media] Creating a new user[" + type + "]");

    switch (type) {
      case C.USERS.SFU:
        user  = new SfuUser(roomId, type, params.userAgentString, params.sdp);
        break;
      case C.USERS.MCU:
        console.log("  [media] createUserMCS MCU TODO");
        break;
      default:
        console.log("  [controller] Unrecognized user type");
    }

    if(!self._users[user.id]) {
      self._users[user.id] = user;
    }

    return Promise.resolve(user);
  }

  getUserMCS (userId) {
    Promise.resolve(self._users[user.id]);
  }
}
