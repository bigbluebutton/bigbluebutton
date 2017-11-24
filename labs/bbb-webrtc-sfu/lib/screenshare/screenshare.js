/*
* Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict'

// Imports
const C = require('../bbb/messages/Constants');
const MediaHandler = require('../media-handler');
const Messaging = require('../bbb/messages/Messaging');
const moment = require('moment');
const h264_sdp = require('../h264-sdp');
const now = moment();
const MCSApi = require('../mcs-core/lib/media/MCSApiStub');
const config = require('config');
const kurentoIp = config.get('kurentoIp');
const localIpAddress = config.get('localIpAddress');

// Global stuff
var sharedScreens = {};
var rtpEndpoints = {};

if (config.get('acceptSelfSignedCertificate')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
}

module.exports = class Screenshare {
  constructor(id, bbbgw, voiceBridge, caller = 'caller', vh, vw, meetingId) {
    this.mcs = new MCSApi();
    this._id = id;
    this._BigBlueButtonGW = bbbgw;
    this._presenterEndpoint = null;
    this._ffmpegEndpoint = null;
    this._voiceBridge = voiceBridge;
    this._meetingId = meetingId;
    this._caller = caller;
    this._streamUrl = "";
    this._vw = vw;
    this._vh = vh;
    this._presenterCandidatesQueue = [];
    this._viewersEndpoint = [];
    this._viewersCandidatesQueue = [];
  }

  onIceCandidate (_candidate) {
    if (this._presenterEndpoint) {
      try {
        this.flushCandidatesQueue(this._presenterEndpoint, this._presenterCandidatesQueue);
        this.mcs.addIceCandidate(this._presenterEndpoint, _candidate);
      }
      catch (err)   {
        console.log(err);
      }
    }
    else {
      this._presenterCandidatesQueue.push(_candidate);
    }
  };

  flushCandidatesQueue (mediaId, queue) {
    if (this.mediaId) {
      try {
        while(queue.length) {
          let candidate = queue.shift();
          this.mcs.addIceCandidate(mediaId, candidate);
        }
      }
      catch (err) {
        console.log(err);
      }
    }
  }

  mediaStateRtp (event) {
    let msEvent = event.event;

    console.log('  [screenshare] ' + msEvent.type + '[' + msEvent.state + ']' + ' for endpoint ' + this._id);

    switch (event.eventTag) {
      case "MediaStateChanged":
        break;

      case "MediaFlowOutStateChange":
        break;

      case "MediaFlowInStateChange":
        if (msEvent.state === 'FLOWING') {
          this._onRtpMediaFlowing();
        }
        else {
          this._onRtpMediaNotFlowing();
        }
        break;

      default: console.log("  [video] Unrecognized event");
    }
  }

  mediaStateWebRtc (event, id) {
    let msEvent = event.event;

    console.log('  [screenshare] ' + msEvent.type + '[' + msEvent.state + ']' + ' for endpoint ' + this._id);

    switch (event.eventTag) {
      case "OnIceCandidate":
        let candidate = msEvent.candidate;
        this._BigBlueButtonGW.publish(JSON.stringify({
          connectionId: id,
          id : 'iceCandidate',
          cameraId: this._id,
          candidate : candidate
        }), C.FROM_SCREENSHARE);

        break;

      case "MediaStateChanged":
        break;

      case "MediaFlowOutStateChange":
        break;

      case "MediaFlowInStateChange":
        break;

      default: console.log("  [video] Unrecognized event");
    }
  }

  async _startPresenter(id, sdpOffer, callback) {
    let presenterSdpAnswer, rtpSdpAnswer;
    let _callback = callback;

    // Force H264 on Firefox and Chrome
    sdpOffer = h264_sdp.transform(sdpOffer);
    console.log(" [screenshare] Starting presenter " + id + " at voiceBridge " + this._voiceBridge);

    try {
      this.userId = await this.mcs.join(this._meetingId, 'SFU', {});
      console.log("  [video] Join returned => " + this.userId);
    }
    catch (err) {
      console.log("  [video] MCS join returned error => " + err);
      return callback(err);
    }

    try {
      const retSource = await this.mcs.publish(this.userId, this._meetingId, 'WebRtcEndpoint', {descriptor: sdpOffer});

      this._presenterEndpoint = retSource.sessionId;
      sharedScreens[id] = this._presenterEndpoint;
      presenterSdpAnswer = retSource.answer;
      this.flushCandidatesQueue(this._presenterEndpoint, this._presenterCandidatesQueue);

      this.mcs.on('MediaEvent' + this._presenterEndpoint, (event) => {
        this.mediaStateWebRtc(event, this._id)
      });

      console.log("  [video] Publish returned => " + this._presenterEndpoint);

    }
    catch (err) {
      console.log("  [video] MCS publish returned error => " + err);
      return callback(err);
    }

    try {
      let sendVideoPort = MediaHandler.getVideoPort();
      let rtpSdpOffer = MediaHandler.generateVideoSdp(localIpAddress, sendVideoPort);

      const retRtp = await this.mcs.subscribe(this.userId, sharedScreens[id], 'RtpEndpoint', {descriptor: rtpSdpOffer});

      this._ffmpegEndpoint = retRtp.sessionId;
      rtpEndpoints[id] = this._ffmpegEndpoint;

      let recvVideoPort = retRtp.answer.match(/m=video\s(\d*)/)[1];
      this._rtpParams = MediaHandler.generateTranscoderParams(kurentoIp, localIpAddress,
          sendVideoPort, recvVideoPort, this._meetingId, "stream_type_video", C.RTP_TO_RTMP, "copy", this._caller, this._voiceBridge);

      this.mcs.on('MediaEvent' + this._ffmpegEndpoint, this.mediaStateRtp.bind(this));

      console.log("  [video] Subscribe returned => " + this._ffmpegEndpoint);

      return callback(null, presenterSdpAnswer);
    }
    catch (err) {
      console.log("  [video] MCS subscribe returned error => " + err);
      return callback(err);
    }
  }

  onViewerIceCandidate(candidate, callerName) {
    if (this._viewersEndpoint[callerName]) {
      try {
        this.flushCandidatesQueue(this._viewersEndpoint[callerName], this._viewersCandidatesQueue[callerName]);
        this.mcs.addIceCandidate(this._viewersEndpoint[callerName], candidate);
      }
      catch (err)   {
        console.log(err);
      }
    }
    else {
      if (!this._viewersCandidatesQueue[callerName]) {
        this._viewersCandidatesQueue[callerName] = [];
      }
      this._viewersCandidatesQueue[callerName].push(candidate);
    }
  }

  async _startViewer(connectionId, voiceBridge, sdp, callerName, presenterEndpoint, callback) {
    let _callback = function(){};
    let sdpAnswer, sdpOffer;
    console.log("  [screenshare] Starting viewer " + callerName + " for voiceBridge " + this._voiceBridge);

    sdpOffer = h264_sdp.transform(sdp);
    sdpOffer = sdp;

    this._viewersCandidatesQueue[callerName] = [];


    try {
      const retSource = await this.mcs.subscribe(this.userId, sharedScreens[voiceBridge], 'WebRtcEndpoint', {descriptor: sdpOffer});

      this._viewersEndpoint[callerName] = retSource.sessionId;
      sdpAnswer = retSource.answer;
      this.flushCandidatesQueue(this._viewersEndpoint[callerName], this._viewersCandidatesQueue[callerName]);
      this.mcs.on('MediaEvent' + this._viewersEndpoint[callerName], (event) => {
        this.mediaStateWebRtc(event, connectionId);
      });

      this._BigBlueButtonGW.publish(JSON.stringify({
        connectionId: connectionId,
        id: "viewerResponse",
        sdpAnswer: sdpAnswer,
        response: "accepted"
      }), C.FROM_SCREENSHARE);

      console.log(" Sent sdp message to client with callerName:" + callerName);
      console.log("  [screenshare] Subscribe returned => " + this._viewersEndpoint[callerName]);
    }
    catch (err) {
      console.log("  [screenshare] MCS publish returned error => " + err);
      return _callback(err);
    }
  }

  async _stop() {
    console.log(' [stop] Releasing endpoints for ' + this.userId);

    this._stopScreensharing();

    if (this._presenterEndpoint) {
      try {
        await this.mcs.leave(this._meetingId, this.userId);
        sharedScreens[this._presenterEndpoint] = null;
        this._candidatesQueue = null;
        this._presenterEndpoint = null;
        this._ffmpegEndpoint = null;
        return;
      }
      catch (err) {
        console.log(err);
        return;
      }
    }
    return;
  }

  _stopScreensharing() {
    let strm = Messaging.generateStopTranscoderRequestMessage(this._meetingId, this._meetingId);

    this._BigBlueButtonGW.publish(strm, C.TO_BBB_TRANSCODE_SYSTEM_CHAN, function(error) {});

    // Interoperability: capturing 1.1 stop_transcoder_reply messages
    this._BigBlueButtonGW.once(C.STOP_TRANSCODER_REPLY, (payload) => {
      let meetingId = payload[C.MEETING_ID];
      this._stopRtmpBroadcast(meetingId);
    });

    // Capturing stop transcoder responses from the 2x model
    this._BigBlueButtonGW.once(C.STOP_TRANSCODER_RESP_2x, (payload) => {
      let meetingId = payload[C.MEETING_ID_2x];
      this._stopRtmpBroadcast(meetingId);
    });

  }

  _onRtpMediaFlowing() {
    console.log("  [screenshare] Media FLOWING for meeting => " + this._meetingId);
    let strm = Messaging.generateStartTranscoderRequestMessage(this._meetingId, this._meetingId, this._rtpParams);

    // Interoperability: capturing 1.1 start_transcoder_reply messages
    this._BigBlueButtonGW.once(C.START_TRANSCODER_REPLY, (payload) => {
      let meetingId = payload[C.MEETING_ID];
      let output = payload["params"].output;
      this._startRtmpBroadcast(meetingId, output);
    });

    // Capturing stop transcoder responses from the 2x model
    this._BigBlueButtonGW.once(C.START_TRANSCODER_RESP_2x, (payload) => {
      let meetingId = payload[C.MEETING_ID_2x];
      let output = payload["params"].output;
      this._startRtmpBroadcast(meetingId, output);
    });


    this._BigBlueButtonGW.publish(strm, C.TO_BBB_TRANSCODE_SYSTEM_CHAN, function(error) {});
  };

  _stopRtmpBroadcast (meetingId) {
    console.log("  [screenshare] _stopRtmpBroadcast for meeting => " + meetingId);
    if(this._meetingId === meetingId) {
      // TODO correctly assemble this timestamp
      let timestamp = now.format('hhmmss');
      let dsrstom = Messaging.generateScreenshareRTMPBroadcastStoppedEvent2x(this._voiceBridge,
          this._voiceBridge, this._streamUrl, this._vw, this._vh, timestamp);
      this._BigBlueButtonGW.publish(dsrstom, C.FROM_VOICE_CONF_SYSTEM_CHAN, function(error) {});
    }
  }

  _startRtmpBroadcast (meetingId, output) {
    console.log("  [screenshare] _startRtmpBroadcast for meeting => " + meetingId);
    if(this._meetingId === meetingId) {
      // TODO correctly assemble this timestamp
      let timestamp = now.format('hhmmss');
      this._streamUrl = MediaHandler.generateStreamUrl(localIpAddress, meetingId, output);
      let dsrbstam = Messaging.generateScreenshareRTMPBroadcastStartedEvent2x(this._voiceBridge,
          this._voiceBridge, this._streamUrl, this._vw, this._vh, timestamp);

      this._BigBlueButtonGW.publish(dsrbstam, C.FROM_VOICE_CONF_SYSTEM_CHAN, function(error) {});
    }
  }

  _onRtpMediaNotFlowing() {
    console.log("  [screenshare] TODO RTP NOT_FLOWING");
  }

  async stopViewer(id) {
    let viewer = this._viewersEndpoint[id];
    console.log(' [stop] Releasing endpoints for ' + viewer);

    if (viewer) {
      try {
        await this.mcs.unsubscribe(this.userId, this.viewer);
        this._viewersCandidatesQueue[id] = null;
        this._viewersEndpoint[id] = null;
        return;
      }
      catch (err) {
        console.log(err);
        return;
      }
    }
  }
};
