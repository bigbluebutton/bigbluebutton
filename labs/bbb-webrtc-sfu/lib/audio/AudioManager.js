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
const errors = require('../base/errors');

module.exports = class AudioManager extends BaseManager {
  constructor (connectionChannel, additionalChannels, logPrefix) {
    super(connectionChannel, additionalChannels, logPrefix);
    this.sfuApp = C.AUDIO_APP;
    this._meetings = {};
    this._trackMeetingTermination();
    this.messageFactory(this._onMessage);
    this._iceQueues = {};
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

  async _onMessage(message) {
    Logger.debug(this._logPrefix, 'Received message [' + message.id + '] from connection', message.connectionId);
    let sessionId = message.voiceBridge;
    let voiceBridge = sessionId;
    let connectionId = message.connectionId;

    let session = this._fetchSession(sessionId);
    let iceQueue = this._fetchIceQueue(sessionId+connectionId);

    switch (message.id) {
      case 'start':
        try {
          if (!session) {
            session = new Audio(this._bbbGW, connectionId, voiceBridge);
          }

          this._meetings[message.internalMeetingId] = sessionId;
          this._sessions[sessionId] = session;

          const { sdpOffer, caleeName, userId, userName } = message;

          // starts audio session by sending sessionID, websocket and sdpoffer
          const sdpAnswer = await session.start(sessionId, connectionId, sdpOffer, caleeName, userId, userName);
          Logger.info(this._logPrefix, "Started presenter ", sessionId, " for connection", connectionId);

          // Empty the ICE queue
          this._flushIceQueue(session, iceQueue);

          session.once(C.MEDIA_SERVER_OFFLINE, async (event) => {
            const errorMessage = this._handleError(this._logPrefix, connectionId, caleeName, C.RECV_ROLE, errors.MEDIA_SERVER_OFFLINE);
            errorMessage.id = 'webRTCAudioError';
            this._bbbGW.publish(JSON.stringify({
              ...errorMessage,
            }), C.FROM_AUDIO);
          });

          this._bbbGW.publish(JSON.stringify({
            connectionId: connectionId,
            id : 'startResponse',
            type: 'audio',
            response : 'accepted',
            sdpAnswer : sdpAnswer
          }), C.FROM_AUDIO);

          Logger.info(this._logPrefix, "Sending startResponse to user", sessionId, "for connection", session._id);
        } catch (err) {
          const errorMessage = this._handleError(this._logPrefix, connectionId, message.caleeName, C.RECV_ROLE, err);
          errorMessage.id = 'webRTCAudioError';
          return this._bbbGW.publish(JSON.stringify({
            ...errorMessage
          }), C.FROM_AUDIO);
        }
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
          iceQueue.push(message.candidate);
        }
        break;

      case 'close':
        Logger.info(this._logPrefix, 'Connection ' + connectionId + ' closed');
        this._deleteIceQueue(sessionId+connectionId);
        if (typeof session !== 'undefined') {
          Logger.info(this._logPrefix, "Stopping viewer " + sessionId);
          session.stopListener(message.connectionId);
        }
        break;

      default:
        const errorMessage = this._handleError(this._logPrefix, connectionId, null, null, errors.SFU_INVALID_REQUEST);
        this._bbbGW.publish(JSON.stringify({
          ...errorMessage,
        }), C.FROM_AUDIO);
        break;
    }
  }
};
