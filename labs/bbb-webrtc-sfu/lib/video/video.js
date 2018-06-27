'use strict';

const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const MCSApi = require('../mcs-core/lib/media/MCSApiStub');
const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');
const Messaging = require('../bbb/messages/Messaging');
const h264_sdp = require('../h264-sdp');
const FORCE_H264 = config.get('webcam-force-h264');
const EventEmitter = require('events').EventEmitter;
const SHOULD_RECORD = config.get('recordWebcams');

var sharedWebcams = {};

module.exports = class Video extends EventEmitter {
  constructor(_bbbGW, _meetingId, _id, _shared, _connectionId) {
    super();
    this.mcs = new MCSApi();
    this.bbbGW = _bbbGW;
    this.id = _id;
    this.connectionId = _connectionId;
    this.meetingId = _meetingId;
    this.shared = _shared;
    this.role = this.shared? 'share' : 'viewer'
    this.streamName = this.connectionId + this.id + "-" + this.role;
    this.mediaId = null;
    this.iceQueue = null;
    this.status = C.MEDIA_STOPPED;
    this.recording = {};
    this.isRecorded = false;

    this.candidatesQueue = [];
    this.notFlowingTimeout = null;

    this.bbbGW.once(C.RECORDING_STATUS_REPLY_MESSAGE_2x+this.meetingId, (payload) => {
      Logger.info("[Video] RecordingStatusReply userId:", payload.requestedBy, "recorded:", payload.recorded);

      if (payload.requestedBy === this.id && payload.recorded) {
        this.isRecorded = true;
      }
    });
  }

  _randomTimeout (low, high) {
    return parseInt(Math.random() * (high - low) + low);
  }

  async onIceCandidate (_candidate) {
    if (this.mediaId) {
      try {
        await this.flushCandidatesQueue();
        await this.mcs.addIceCandidate(this.mediaId, _candidate);
      }
      catch (err)   {
        Logger.error("[video] ICE candidate could not be added to media controller.", err);
      }
    }
    else {
      this.candidatesQueue.push(_candidate);
    }
  };

  async flushCandidatesQueue () {
    return new Promise((resolve, reject) => {
      if (this.mediaId) {
        let iceProcedures = this.candidatesQueue.map((candidate) => {
          this.mcs.addIceCandidate(this.mediaId, candidate);
        });

        return Promise.all(iceProcedures).then(() => {
          this.candidatesQueue = [];
          resolve();
        }).catch((err) => {
          Logger.error("[video] ICE candidate could not be added to media controller.", err);
          reject();
        });
      }
    });
  }

  serverState (event) {
    switch (event && event.eventTag) {
      case C.MEDIA_SERVER_OFFLINE:
        Logger.error("[video] Video provider received MEDIA_SERVER_OFFLINE event");
        this.bbbGW.publish(JSON.stringify({
          connectionId: this.connectionId,
          type: 'video',
          id : 'error',
          response : 'rejected',
          cameraId : this.id,
          message : C.MEDIA_SERVER_OFFLINE
        }), C.FROM_VIDEO);
        this.emit(C.MEDIA_SERVER_OFFLINE, event);
        break;

      default:
        Logger.warn("[video] Unknown server state", event);
    }
  }


  mediaState (event) {
    let msEvent = event.event;

    switch (event.eventTag) {

      case "OnIceCandidate":
        let candidate = msEvent.candidate;
        Logger.debug("[video] Sending ICE candidate to user", this.streamName, "with candidate", candidate);
        this.bbbGW.publish(JSON.stringify({
          connectionId: this.connectionId,
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
        Logger.info('[video] ' + msEvent.type + '[' + msEvent.state + ']' + ' for media session', event.id, "for video", this.streamName);

        if (msEvent.state === 'NOT_FLOWING' && this.status !== C.MEDIA_PAUSED) {
          Logger.warn("[video] Setting up a timeout for", this.streamName);
          if (!this.notFlowingTimeout) {
            this.notFlowingTimeout = setTimeout(() => {

              if (this.shared) {
                this.sendPlayStop();
                this.status = C.MEDIA_STOPPED;
                clearTimeout(this.notFlowingTimeout);
                delete this.notFlowingTimeout;
              }
            }, config.get('mediaFlowTimeoutDuration') + this._randomTimeout(-2000, 2000));
          }
        }
        else if (msEvent.state === 'FLOWING') {
          if (this.notFlowingTimeout) {
            Logger.warn("[video] Received a media flow before stopping", this.streamName);
            clearTimeout(this.notFlowingTimeout);
            delete this.notFlowingTimeout;
          }
          if (this.status !== C.MEDIA_STARTED) {

            // Record the video stream if it's the original being shared
            if (this.shouldRecord()) {
              this.startRecording();
            }

            this.sendPlayStart();

            this.status = C.MEDIA_STARTED;
          }

        }
        break;

      default: Logger.warn("[video] Unrecognized event", event);
    }
  }

  sendPlayStart () {
    this.bbbGW.publish(JSON.stringify({
       connectionId: this.connectionId,
       type: 'video',
       role: this.role,
       id : 'playStart',
       cameraId: this.id,
    }), C.FROM_VIDEO);
  }

  sendPlayStop () {
    let userCamEvent =
      Messaging.generateUserCamBroadcastStoppedEventMessage2x(this.meetingId, this.id, this.id);
    this.bbbGW.publish(userCamEvent, function(error) {});

    this.bbbGW.publish(JSON.stringify({
      connectionId: this.connectionId,
      type: 'video',
      role: this.role,
      id : 'playStop',
      cameraId: this.id,
    }), C.FROM_VIDEO);
  }

  sendGetRecordingStatusRequestMessage() {
    let req = Messaging.generateRecordingStatusRequestMessage(this.meetingId, this.id);

    this.bbbGW.publish(req, C.TO_AKKA_APPS);
  }

  shouldRecord () {
    return this.isRecorded && this.shared;
  }

  async startRecording() {
    return new Promise(async (resolve, reject) => {
      try {
        this.recording = await this.mcs.startRecording(this.userId, this.mediaId, this.id);
        this.mcs.on('MediaEvent' + this.recording.recordingId, this.recordingState.bind(this));
        this.sendStartShareEvent();
        resolve(this.recording);
      }
      catch (err) {
        Logger.error("[video] Error on start recording with message", err);
        reject(err);
      }
    });
  }

  async stopRecording() {
    await this.mcs.stopRecording(this.userId, this.mediaId, this.recording.recordingId);
    this.sendStopShareEvent();
    this.recording = {};
  }

  recordingState(event) {
    const msEvent = event.event;
    Logger.info('[Recording]', msEvent.type, '[', msEvent.state, ']', 'for recording session', event.id, 'for video', this.streamName);
  }

  start (sdpOffer) {
    return new Promise(async (resolve, reject) => {

    Logger.info("[video] Starting video instance for", this.streamName);

    // Force H264
    if (FORCE_H264) {
      sdpOffer = h264_sdp.transform(sdpOffer);
    }

    // Start the recording process
    if (SHOULD_RECORD && this.shared) {
      this.sendGetRecordingStatusRequestMessage();
    }

    try {
      this.userId = await this.mcs.join(this.meetingId, 'SFU', {});
      Logger.info("[video] MCS join for", this.streamName, "returned", this.userId);
      const sdpAnswer = await this._addMCSMedia(C.WEBRTC, sdpOffer);
      this.mcs.on('MediaEvent' + this.mediaId, this.mediaState.bind(this));
      this.mcs.on('ServerState' + this.mediaId, this.serverState.bind(this));
      this.status = C.MEDIA_STARTING;
      await this.flushCandidatesQueue();
      Logger.info("[video] MCS call for user", this.userId, "returned", this.mediaId);
      return resolve(sdpAnswer);
    }
    catch (err) {
      Logger.error("[video] MCS returned error => " + err);
      return reject(err);
    }
    });
  }

  _addMCSMedia (type, descriptor) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.shared) {
          let { answer, sessionId } = await this.mcs.publish(this.userId, this.meetingId, type, { descriptor });
          this.mediaId = sessionId;
          sharedWebcams[this.id] = this.mediaId;
          return resolve(answer);
        }
        else if (sharedWebcams[this.id]) {
          let { answer, sessionId } = await this.mcs.subscribe(this.userId, sharedWebcams[this.id], C.WEBRTC, { descriptor });
          this.mediaId = sessionId;
          return resolve(answer);
        }
      }
      catch (err) {
        return reject(err);
      }
    });
  }

  async pause (state) {
    const sourceId = sharedWebcams[this.id];
    const sinkId = this.mediaId;

    if (sourceId == null || sinkId == null) {
      Logger.error("[video] Source or sink is null.");
      return;
    }

    // We want to pause the stream
    try {
      if (state && (this.status !== C.MEDIA_STARTING || this.status !== C.MEDIA_PAUSED)) {
        await this.mcs.disconnect(sourceId, sinkId, 'VIDEO');
        this.status = C.MEDIA_PAUSED;
      }
      else if (!state && this.status === C.MEDIA_PAUSED) { //un-pause
        await this.mcs.connect(sourceId, sinkId, 'VIDEO');
        this.status = C.MEDIA_STARTED;
      }
    }
    catch (err) {
      Logger.error("[video] MCS returned error on pause procedure with message", err);
    }
  }

  sendStartShareEvent() {
    let shareCamEvent = Messaging.generateWebRTCShareEvent('StartWebRTCShareEvent', this.meetingId, this.recording.filename);
    this.bbbGW.writeMeetingKey(this.meetingId, shareCamEvent, function(error) {});
  }

  sendStopShareEvent () {
    let stopShareEvent =
      Messaging.generateWebRTCShareEvent('StopWebRTCShareEvent', this.meetingId, this.recording.filename);
    this.bbbGW.writeMeetingKey(this.meetingId, stopShareEvent, function(error) {});
  }

  async stop () {
    return new Promise(async (resolve, reject) => {
      Logger.info('[video] Stopping video session', this.userId, 'at room', this.meetingId);

      try {
        await this.mcs.leave(this.meetingId, this.userId);

        if (this.shouldRecord()) {
          this.sendStopShareEvent();
        }

        if (this.shared) {
          delete sharedWebcams[this.id];
        }

        if (this.notFlowingTimeout) {
          clearTimeout(this.notFlowingTimeout);
          delete this.notFlowingTimeout;
        }

        delete this._candidatesQueue;
        resolve();
      }
      catch (err) {
        // TODO error handling
        reject();
      }
    });
  }
};
