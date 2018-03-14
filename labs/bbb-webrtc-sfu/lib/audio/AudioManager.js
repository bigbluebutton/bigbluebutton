/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

"use strict";

const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
const Audio = require('./audio');
const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');

module.exports = class AudioManager {
  constructor () {
    this._clientId = 0;

    this._meetings = {};
    this._audioSessions = {};

    this._bbbGW = new BigBlueButtonGW('MANAGER');
    this._redisGateway;
  }

  async start() {
    try {
      this._redisGateway = await this._bbbGW.addSubscribeChannel(C.TO_AUDIO);
      const meeting = await this._bbbGW.addSubscribeChannel(C.FROM_BBB_MEETING_CHAN);
      this._redisGateway.on(C.REDIS_MESSAGE, this._onMessage.bind(this));

      // Interoperability between transcoder messages
      // TODO: Do we need to remove this listeners at some point?
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
    catch (error) {
      Logger.error('[AudioManager] Could not connect to audio redis channel, finishing audio app with error', error);
      this.stopAll();
    }
  }

  _disconnectAllUsers(meetingId) {
    let sessionId = this._meetings[meetingId];
    if (typeof sessionId !== 'undefined') {
      Logger.debug('[AudioManager] Disconnecting all users from', sessionId);
      delete this._meetings[meetingId];
      this._stopSession(sessionId);
    }
  }

  _onMessage(message) {
    Logger.debug('[AudioManager] Received message [' + message.id + '] from connection', message.connectionId);
    let session;

    let sessionId = message.voiceBridge.split('-')[0];
    let voiceBridge = sessionId;
    let connectionId = message.connectionId;

    if(this._audioSessions[sessionId]) {
      session = this._audioSessions[sessionId];
    }

    switch (message.id) {
      case 'start':

        if (!session) {
          session = new Audio(this._bbbGW, connectionId, voiceBridge);
        }

        this._meetings[message.internalMeetingId] = {};
        this._meetings[message.internalMeetingId] = sessionId;
        this._audioSessions[sessionId] = {}
        this._audioSessions[sessionId] = session;

        // starts audio session by sending sessionID, websocket and sdpoffer
        session.start(sessionId, connectionId, message.sdpOffer, message.callerName, message.userId, message.userName, (error, sdpAnswer) => {
          Logger.info("[AudioManager] Started presenter ", sessionId, " for connection", connectionId);
          Logger.debug("[AudioManager] SDP answer was", sdpAnswer);
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

          Logger.info("[AudioManager] Sending startResponse to user", sessionId, "for connection", session._id);
        });
        break;

      case 'stop':
        Logger.info('[AudioManager] Received stop message for session', sessionId, "at connection", connectionId);

        if (session) {
          session.stopListener(connectionId);
        } else {
          Logger.warn("[AudioManager] There was no audio session on stop for", sessionId);
        }
        break;

      case 'iceCandidate':
        if (session) {
          session.onIceCandidate(message.candidate, connectionId);
        } else {
          Logger.warn("[AudioManager] There was no audio session for onIceCandidate for", sessionId, ". There should be a queue here");
        }
        break;

      case 'close':
        Logger.info('[AudioManager] Connection ' + connectionId + ' closed');

        if (typeof session !== 'undefined') {
          Logger.info("[AudioManager] Stopping viewer " + sessionId);
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

  _stopSession(sessionId) {
    Logger.info('[AudioManager] Stopping session ' + sessionId);

    if (typeof this._audioSessions === 'undefined' || typeof sessionId === 'undefined') {
      return;
    }

    let session = this._audioSessions[sessionId];
    if(typeof session !== 'undefined' && typeof session.stopAll === 'function') {
      session.stopAll();
    }

    delete this._audioSessions[sessionId];
  }

  stopAll() {
    Logger.info('[AudioManager] Stopping everything! ');

    if (typeof this._audioSessions === 'undefined') {
      return;
    }

    let sessionIds = Object.keys(this._audioSessions);

    for (let i = 0; i < sessionIds.length; i++) {
      this._stopSession(sessionIds[i]);
    }
  }
};
