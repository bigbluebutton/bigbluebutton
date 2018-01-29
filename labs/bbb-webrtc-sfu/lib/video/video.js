'use strict';
// Global stuff
var sharedWebcams = {};

const kurento = require('kurento-client');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const MCSApi = require('../mcs-core/lib/media/MCSApiStub');
const C = require('../bbb/messages/Constants');

if (config.get('acceptSelfSignedCertificate')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
}

module.exports = class Video {
  constructor(_bbbGW, _id, _shared, _sessionId) {
    this.mcs = new MCSApi();
    this.bbbGW = _bbbGW;
    this.id = _id;
    this.sessionId = _sessionId;
    this.meetingId = _id;
    this.shared = _shared;
    this.role = this.shared? 'share' : 'view'
    this.webRtcEndpoint = null;
    this.mediaId = null;
    this.iceQueue = null;

    this.candidatesQueue = [];
  }

  onIceCandidate (_candidate) {
    if (this.mediaId) {
      try {
        this.flushCandidatesQueue();
        this.mcs.addIceCandidate(this.mediaId, _candidate);
      }
      catch (err)   {
        console.log(err);
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
        console.log(err);
      }
    }
  }

  mediaState (event) {
    let msEvent = event.event;

    switch (event.eventTag) {

      case "OnIceCandidate":
        //console.log("  [video] Sending ICE candidate to user => " + this.id);
        let candidate = msEvent.candidate;
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
        console.log(' [video] ' + msEvent.type + '[' + msEvent.state + ']' + ' for endpoint ' + this.id);

        if (msEvent.state === 'NOT_FLOWING') {
          this.bbbGW.publish(JSON.stringify({
            connectionId: this.sessionId,
            type: 'video',
            role: this.role,
            id : 'playStop',
            cameraId: this.id,
          }), C.FROM_VIDEO);
        }
        else if (msEvent.state === 'FLOWING') {
          this.bbbGW.publish(JSON.stringify({
            connectionId: this.sessionId,
            type: 'video',
            role: this.role,
            id : 'playStart',
            cameraId: this.id,
          }), C.FROM_VIDEO);
        }

        break;

      default: console.log("  [video] Unrecognized event");
    }
  }

  async start (sdpOffer, callback) {
    console.log("  [video] start");
    let sdpAnswer;

    try {
      this.userId = await this.mcs.join(this.meetingId, 'SFU', {});
      console.log("  [video] Join returned => " + this.userId);

      if (this.shared) {
        const ret = await this.mcs.publish(this.userId, this.meetingId, 'WebRtcEndpoint', {descriptor: sdpOffer});

        this.mediaId = ret.sessionId;
        sharedWebcams[this.id] = this.mediaId;
        sdpAnswer = ret.answer;
        this.flushCandidatesQueue();
        this.mcs.on('MediaEvent' + this.mediaId, this.mediaState.bind(this));

        console.log("  [video] Publish returned => " + this.mediaId);

        return callback(null, sdpAnswer);
      }
      else {
        const ret  = await this.mcs.subscribe(this.userId, sharedWebcams[this.id], 'WebRtcEndpoint', {descriptor: sdpOffer});

        this.mediaId = ret.sessionId;
        sdpAnswer = ret.answer;
        this.flushCandidatesQueue();
        this.mcs.on('MediaEvent' + this.mediaId, this.mediaState.bind(this));

        console.log("  [video] Subscribe for user ", this.userId, " returned => " + this.mediaId);

        return callback(null, sdpAnswer);
      }
    }
    catch (err) {
      console.log("  [video] MCS returned error => " + err);
      return callback(err);
    }
  };

  async stop () {
    console.log(' [stop] Releasing endpoints for user ' + this.userId + ' at room ' + this.meetingId);

    try {
      await this.mcs.leave(this.meetingId, this.userId);
      if (this.shared) {
        sharedWebcams[this.id] = null;
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
