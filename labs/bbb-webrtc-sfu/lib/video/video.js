'use strict';

const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const MCSApi = require('../mcs-core/lib/media/MCSApiStub');
const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');
const Messaging = require('../bbb/messages/Messaging');
const h264_sdp = require('../h264-sdp');

var sharedWebcams = {};

module.exports = class Video {
  constructor(_bbbGW, _meetingId, _id, _shared, _sessionId) {
    this.mcs = new MCSApi();
    this.bbbGW = _bbbGW;
    this.id = _id;
    this.sessionId = _sessionId;
    this.meetingId = _meetingId;
    this.shared = _shared;
    this.role = this.shared? 'share' : 'view'
    this.mediaId = null;
    this.iceQueue = null;

    this.candidatesQueue = [];
    this.notFlowingTimeout = null;
  }

  onIceCandidate (_candidate) {
    if (this.mediaId) {
      try {
        this.flushCandidatesQueue();
        this.mcs.addIceCandidate(this.mediaId, _candidate);
      }
      catch (err)   {
        Logger.error("[video] ICE candidate could not be added to media controller.", err);
      }
    }
    else {
      this.candidatesQueue.push(_candidate);
    }
  };

  flushCandidatesQueue () {
    if (this.mediaId) {
      try {
        while(this.candidatesQueue.length) {
          let candidate = this.candidatesQueue.shift();
          this.mcs.addIceCandidate(this.mediaId, candidate);
        }
      }
      catch (err) {
        Logger.error("[video] ICE candidate could not be added to media controller.", err);
      }
    }
  }

  mediaState (event) {
    let msEvent = event.event;

    switch (event.eventTag) {

      case "OnIceCandidate":
        let candidate = msEvent.candidate;
        Logger.debug("[video] Sending ICE candidate to user", this.id, "with candidate", candidate);
        this.bbbGW.publish(JSON.stringify({
          connectionId: this.sessionId,
          type: 'video',
          role: this.role,
          id : 'iceCandidate',
          cameraId: this.id,
          candidate: candidate
        }), C.FROM_VIDEO);
        break;

      case "MediaStateChanged":
        break;

      case "MediaFlowOutStateChange":
      case "MediaFlowInStateChange":
        Logger.info('[video] ' + msEvent.type + '[' + msEvent.state + ']' + ' for media session', event.id, "for video", this.id);

        if (msEvent.state === 'NOT_FLOWING') {
          Logger.warn("Setting up a timeout for " + this.sessionId + " camera " + this.id);
          if (!this.notFlowingTimeout) {
            this.notFlowingTimeout = setTimeout(() => {

              if (this.shared) {
                let userCamEvent =
                  Messaging.generateUserCamBroadcastStoppedEventMessage2x(this.meetingId, this.id, this.id);
                this.bbbGW.publish(userCamEvent, C.TO_AKKA_APPS, function(error) {});
              }
            }, config.get('mediaFlowTimeoutDuration'));
          }
        }
        else if (msEvent.state === 'FLOWING') {
          if (this.notFlowingTimeout) {
            Logger.warn("Received a media flow before stopping " + this.sessionId + " camera " + this.id);
            clearTimeout(this.notFlowingTimeout);
            this.notFlowingTimeout = null;
          }

          this.bbbGW.publish(JSON.stringify({
            connectionId: this.sessionId,
            type: 'video',
            role: this.role,
            id : 'playStart',
            cameraId: this.id,
          }), C.FROM_VIDEO);

          // Record the video stream if it's the original being shared
          if (config.get('recordWebcams') && this.shared) {
            this.startRecording();
          }
        }

        break;

      default: Logger.warn("[video] Unrecognized event");
    }
  }

  async startRecording() {
    this.recordingId = await this.mcs.startRecording(this.userId, this.mediaId, this.id);
  }

  async start (sdpOffer, callback) {
    Logger.info("[video] Starting video instance for", this.id);
    let sdpAnswer;

    // Force H264
    sdpOffer = h264_sdp.transform(sdpOffer);

    try {
      this.userId = await this.mcs.join(this.meetingId, 'SFU', {});
      Logger.info("[video] MCS join for", this.id, "returned", this.userId);

      if (this.shared) {
        const ret = await this.mcs.publish(this.userId, this.meetingId, 'WebRtcEndpoint', {descriptor: sdpOffer});

        this.mediaId = ret.sessionId;

        sharedWebcams[this.id] = this.mediaId;
        sdpAnswer = ret.answer;
        this.flushCandidatesQueue();
        this.mcs.on('MediaEvent' + this.mediaId, this.mediaState.bind(this));

        Logger.info("[video] MCS publish for user", this.userId, "returned", this.mediaId);

        return callback(null, sdpAnswer);
      }
      else {
        const ret  = await this.mcs.subscribe(this.userId, sharedWebcams[this.id], 'WebRtcEndpoint', {descriptor: sdpOffer});

        this.mediaId = ret.sessionId;
        sdpAnswer = ret.answer;
        this.flushCandidatesQueue();
        this.mcs.on('MediaEvent' + this.mediaId, this.mediaState.bind(this));

        Logger.info("[video] MCS subscribe for user", this.userId, "returned", this.mediaId);

        return callback(null, sdpAnswer);
      }
    }
    catch (err) {
      Logger.error("[video] MCS returned error => " + err);
      return callback(err);
    }
  };

  async stop () {
    Logger.info('[video] Releasing endpoints for user', this.userId, 'at room', this.meetingId);

    try {
      await this.mcs.leave(this.meetingId, this.userId);
      if (this.shared) {
        sharedWebcams[this.id] = null;
      }

      if (this.notFlowingTimeout) {
        clearTimeout(this.notFlowingTimeout);
        this.notFlowingTimeout = null;
      }

      this._candidatesQueue = null;
      Promise.resolve();
    }
    catch (err) {
      // TODO error handling
      Promise.reject();
    }
    return;
  };
};
