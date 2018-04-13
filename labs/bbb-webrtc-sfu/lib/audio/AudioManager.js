/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

"use strict";

const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
const Audio = require('./audio');
const BaseManager = require('../base/BaseManager');
const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');

module.exports = class AudioManager extends BaseManager {
  constructor (connectionChannel, additionalChannels, logPrefix) {
    super(connectionChannel, additionalChannels, logPrefix);
    this._meetings = {};
    this._trackMeetingTermination();
    this.messageFactory(this._onMessage);
  }

  _trackMeetingTermination () {
    switch (C.COMMON_MESSAGE_VERSION) {
      case "1.x":
        this._bbbGW.on(C.DICONNECT_ALL_USERS, (payload) => {
          let meetingId = payload[C.MEETING_ID];
          this._disconnectAllUsers(meetingId);
        });
        break;
      default:
        this._bbbGW.on(C.DICONNECT_ALL_USERS_2x, (payload) => {
          let meetingId = payload[C.MEETING_ID_2x];
          this._disconnectAllUsers(meetingId);
        });
    }
  }

  _disconnectAllUsers(meetingId) {
    let sessionId = this._meetings[meetingId];
    if (typeof sessionId !== 'undefined') {
      Logger.debug(this._logPrefix, 'Disconnecting all users from', sessionId);
      delete this._meetings[meetingId];
      this._stopSession(sessionId);
    }
  }

  _onMessage(message) {
    Logger.debug(this._logPrefix, 'Received message [' + message.id + '] from connection', message.connectionId);
    let session;

    let sessionId = message.voiceBridge.split('-')[0];
    let voiceBridge = sessionId;
    let connectionId = message.connectionId;

    if(this._sessions[sessionId]) {
      session = this._sessions[sessionId];
    }

    switch (message.id) {
      case 'start':

        if (!session) {
          session = new Audio(this._bbbGW, connectionId, voiceBridge);
        }

        this._meetings[message.internalMeetingId] = {};
        this._meetings[message.internalMeetingId] = sessionId;
        this._sessions[sessionId] = {}
        this._sessions[sessionId] = session;

        // starts audio session by sending sessionID, websocket and sdpoffer
        session.start(sessionId, connectionId, message.sdpOffer, message.callerName, message.userId, message.userName, (error, sdpAnswer) => {
          Logger.info(this._logPrefix, "Started presenter ", sessionId, " for connection", connectionId);
          Logger.debug(this._logPrefix, "SDP answer was", sdpAnswer);
          if (error) {
            this._bbbGW.publish(JSON.stringify({
              connectionId: connectionId,
              type: 'audio',
              id : 'startResponse',
              response : 'rejected',
              message : error
            }), C.FROM_AUDIO);
            return error;
          }

          this._bbbGW.publish(JSON.stringify({
            connectionId: connectionId,
            id : 'startResponse',
            type: 'audio',
            response : 'accepted',
            sdpAnswer : sdpAnswer
          }), C.FROM_AUDIO);

          Logger.info(this._logPrefix, "Sending startResponse to user", sessionId, "for connection", session._id);
        });
        break;

      case 'stop':
        Logger.info(this._logPrefix, 'Received stop message for session', sessionId, "at connection", connectionId);

        if (session) {
          session.stopListener(connectionId);
        } else {
          Logger.warn(this._logPrefix, "There was no audio session on stop for", sessionId);
        }
        break;

      case 'iceCandidate':
        if (session) {
          session.onIceCandidate(message.candidate, connectionId);
        } else {
          Logger.warn(this._logPrefix, "There was no audio session for onIceCandidate for", sessionId, ". There should be a queue here");
        }
        break;

      case 'close':
        Logger.info(this._logPrefix, 'Connection ' + connectionId + ' closed');

        if (typeof session !== 'undefined') {
          Logger.info(this._logPrefix, "Stopping viewer " + sessionId);
          session.stopListener(message.connectionId);
        }
        break;

      default:
        this._bbbGW.publish(JSON.stringify({
          connectionId: connectionId,
          id : 'error',
          type: 'audio',
          message: 'Invalid message ' + message
        }), C.FROM_AUDIO);
        break;
    }
  }
};
