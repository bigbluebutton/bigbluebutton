'use strict';

const kurento = require('kurento-client');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const MCSApi = require('../mcs-core/lib/media/MCSApiStub');
const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');
const Messaging = require('../bbb/messages/Messaging');

module.exports = class Audio {
  constructor(_bbbGW, _id, voiceBridge) {
    this.mcs = new MCSApi();
    this.bbbGW = _bbbGW;
    this.id = _id;
    this.voiceBridge = voiceBridge;
    this.sourceAudio;
    this.sourceAudioStarted = false;
    this.audioEndpoints = {};
    this.role;
    this.webRtcEndpoint = null;
    this.userId;

    this.connectedUsers = {};
    this.candidatesQueue = {}
  }

  onIceCandidate (_candidate, connectionId) {
    if (this.audioEndpoints[connectionId]) {
      try {
        this.flushCandidatesQueue(connectionId);
        this.mcs.addIceCandidate(this.audioEndpoints[connectionId], _candidate);
      }
      catch (err)   {
        Logger.error("[audio] ICE candidate could not be added to media controller.", err);
      }
    }
    else {
      if(!this.candidatesQueue[connectionId]) {
        this.candidatesQueue[connectionId] = [];
      }
      this.candidatesQueue[connectionId].push(_candidate);
    }
  };

  flushCandidatesQueue (connectionId) {
    if (this.audioEndpoints[connectionId]) {
      try {
        while(this.candidatesQueue[connectionId].length) {
          let candidate = this.candidatesQueue[connectionId].shift();
          this.mcs.addIceCandidate(this.audioEndpoints[connectionId], candidate);
        }
      }
      catch (err) {
        Logger.error("[audio] ICE candidate could not be added to media controller.", err);
      }
    }
  }

/**
 * Include user to a hash object indexed by it's connectionId
 * @param  {String} connectionId Current connection id at the media manager
 * @param  {Object} user {userId: String, userName: String}
 */
  addUser(connectionId, user) {
    if (this.connectedUsers.hasOwnProperty(connectionId)) {
      Logger.warn("[audio] Updating user for connectionId", connectionId)
    }
    this.connectedUsers[connectionId] = user;
  };

/**
 * Exclude user from a hash object indexed by it's connectionId
 * @param  {String} connectionId Current connection id at the media manager
 */
  removeUser(connectionId) {
    if (this.connectedUsers.hasOwnProperty(connectionId)) {
      delete this.connectedUsers[connectionId];
    } else {
      Logger.error("[audio] Missing connectionId", connectionId);
    }
  };

/**
 * Consult user from a hash object indexed by it's connectionId
 * @param  {String} connectionId Current connection id at the media manager
 * @return  {Object} user {userId: String, userName: String}
 */
  getUser(connectionId) {
    if (this.connectedUsers.hasOwnProperty(connectionId)) {
      return this.connectedUsers[connectionId];
    } else {
      Logger.error("[audio] Missing connectionId", connectionId);
    }
  };

  mediaState (event) {
    let msEvent = event.event;

    switch (event.eventTag) {

      case "MediaStateChanged":
        break;

      default: Logger.warn("[audio] Unrecognized event");
    }
  }

  mediaStateWebRtc (event, id) {
    let msEvent = event.event;

    switch (event.eventTag) {
      case "OnIceCandidate":
        let candidate = msEvent.candidate;
        Logger.debug('[audio] Received ICE candidate from mcs-core for media session', event.id, '=>', candidate);

        this.bbbGW.publish(JSON.stringify({
          connectionId: id,
          id : 'iceCandidate',
          type: 'audio',
          cameraId: this._id,
          candidate : candidate
        }), C.FROM_AUDIO);

        break;

      case "MediaStateChanged":
        break;

      case "MediaFlowOutStateChange":
        Logger.info('[audio]', msEvent.type, '[' + msEvent.state? msEvent.state : 'UNKNOWN_STATE' + ']', 'for media session',  event.id);
        // TODO treat this accordingly =( (prlanzarin 05/02/2018)

        break;

      case "MediaFlowInStateChange":
        Logger.info('[audio]', msEvent.type, '[' + msEvent.state? msEvent.state : 'UNKNOWN_STATE' + ']', 'for media session ',  event.id);
        if (msEvent.state === 'FLOWING') {
          this._onRtpMediaFlowing(id);
        } else {
          this._onRtpMediaNotFlowing(id);
        }
        break;

      default: Logger.warn("[audio] Unrecognized event", event);
    }
  }

  async start (sessionId, connectionId, sdpOffer, callerName, userId, userName, callback) {
    Logger.info("[audio] Starting audio instance for", this.id);
    let sdpAnswer;

    // Storing the user data to be used by the pub calls
    let user = {userId: userId, userName: userName};
    this.addUser(connectionId, user);

    try {
      if (!this.sourceAudioStarted) {
        this.userId = await this.mcs.join(this.voiceBridge, 'SFU', {});
        Logger.info("[audio] MCS join for", this.id, "returned", this.userId);

        const ret = await this.mcs.publish(this.userId,
            this.voiceBridge,
            'RtpEndpoint',
            {descriptor: sdpOffer, adapter: 'Freeswitch', name: callerName});

        this.sourceAudio = ret.sessionId;
        this.mcs.on('MediaEvent' + this.sourceAudio, this.mediaState.bind(this));
        this.sourceAudioStarted = true;

        Logger.info("[audio] MCS publish for user", this.userId, "returned", this.sourceAudio);
      }

      const retSubscribe  = await this.mcs.subscribe(this.userId,
          this.sourceAudio,
          'WebRtcEndpoint',
          {descriptor: sdpOffer, adapter: 'Kurento'});

      this.audioEndpoints[connectionId] = retSubscribe.sessionId;

      sdpAnswer = retSubscribe.answer;
      this.flushCandidatesQueue(connectionId);

      this.mcs.on('MediaEvent' + retSubscribe.sessionId, (event) => {
        this.mediaStateWebRtc(event, connectionId)
      });

      Logger.info("[audio] MCS subscribe for user", this.userId, "returned", retSubscribe.sessionId);

      return callback(null, sdpAnswer);
    }
    catch (err) {
      Logger.error("[audio] MCS returned error => " + err);
      return callback(err);
    }
  };

  async stopListener(id) {
    let listener = this.audioEndpoints[id];
    Logger.info('[audio] Releasing endpoints for', listener);

    this.sendUserDisconnectedFromGlobalAudioMessage(id);

    if (listener) {
      try {
        if (this.audioEndpoints && Object.keys(this.audioEndpoints).length === 1) {
          await this.mcs.leave(this.voiceBridge, this.userId);
          this.sourceAudioStarted = false;
        }
        else {
          await this.mcs.unsubscribe(this.userId, listener);
        }

        delete this.candidatesQueue[id];
        delete this.audioEndpoints[id];

        return;
      }
      catch (err) {
        Logger.error('[audio] MCS returned error when trying to unsubscribe', err);
        return;
      }
    }
  }

  async stop () {
    Logger.info('[audio] Releasing endpoints for user', this.userId, 'at room', this.voiceBridge);

    try {
      await this.mcs.leave(this.voiceBridge, this.userId);

      for (var listener in this.audioEndpoints) {
        delete this.audioEndpoints[listener];
      }

      for (var queue in this.candidatesQueue) {
        delete this.candidatesQueue[queue];
      }

      for (var connection in this.connectedUsers) {
        this.sendUserDisconnectedFromGlobalAudioMessage(connection);
      }

      this.sourceAudioStarted = false;

      return Promise.resolve();
    }
    catch (err) {
      // TODO error handling
      return Promise.reject();
    }
  };

  sendUserDisconnectedFromGlobalAudioMessage(connectionId) {
    let user = this.getUser(connectionId);
    let msg = Messaging.generateUserDisconnectedFromGlobalAudioMessage(this.voiceBridge, user.userId, user.userName);
    Logger.info('[audio] Sending global audio disconnection for user', user);

    // Interoperability between transcoder messages
    switch (C.COMMON_MESSAGE_VERSION) {
      case "1.x":
        this.bbbGW.publish(msg, C.TO_BBB_MEETING_CHAN, function(error) {});
        break;
      default:
        this.bbbGW.publish(msg, C.TO_AKKA_APPS_CHAN_2x, function(error) {});
    }

    this.removeUser(connectionId);
  };

  sendUserConnectedToGlobalAudioMessage(connectionId) {
    let user = this.getUser(connectionId);
    let msg = Messaging.generateUserConnectedToGlobalAudioMessage(this.voiceBridge, user.userId, user.userName);
    Logger.info('[audio] Sending global audio connection for user', user);

    // Interoperability between transcoder messages
    switch (C.COMMON_MESSAGE_VERSION) {
      case "1.x":
        this.bbbGW.publish(msg, C.TO_BBB_MEETING_CHAN, function(error) {});
        break;
      default:
        this.bbbGW.publish(msg, C.TO_AKKA_APPS_CHAN_2x, function(error) {});
    }
  };

  _onRtpMediaFlowing(connectionId) {
    Logger.info("[audio] RTP Media FLOWING for voice bridge", this.voiceBridge);
    this.sendUserConnectedToGlobalAudioMessage(connectionId);
    this.bbbGW.publish(JSON.stringify({
        connectionId: connectionId,
        id: "webRTCAudioSuccess",
        success: "MEDIA_FLOWING"
    }), C.FROM_AUDIO);
  };

  _onRtpMediaNotFlowing(connectionId) {
    Logger.warn("[audio] RTP Media NOT FLOWING for voice bridge" + this.voiceBridge);
    this.bbbGW.publish(JSON.stringify({
        connectionId: connectionId,
        id: "webRTCAudioError",
        error: C.MEDIA_ERROR
    }), C.FROM_AUDIO);
    this.removeUser(connectionId);
  };
};
