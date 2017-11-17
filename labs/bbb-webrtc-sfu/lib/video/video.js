'use strict';
// Global stuff
var sharedWebcams = {};

const kurento = require('kurento-client');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const MCSApi = require('../mcs-core/lib/media/MCSApiStub');

if (config.get('acceptSelfSignedCertificate')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
}

module.exports = class Video {
  constructor(_ws, _id, _shared) {
    this.mcs = new MCSApi();
    this.ws = _ws;
    this.id = _id;
    this.meetingId = _id;
    this.shared = _shared;
    this.webRtcEndpoint = null;
    this.mediaId = null;

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
        console.log("  [video] Sending ICE candidate to user => " + this.id);
        let candidate = msEvent.candidate;
        this.ws.sendMessage({ id : 'iceCandidate', cameraId: this.id, candidate : candidate });
        break;

      case "MediaStateChanged":
        break;

      case "MediaFlowOutStateChange":
      case "MediaFlowInStateChange":
        console.log(' [video] ' + msEvent.type + '[' + msEvent.state + ']' + ' for endpoint ' + this.id);

        if (msEvent.state === 'NOT_FLOWING') {
          this.ws.sendMessage({ id : 'playStop', cameraId : this.id });
        } 
        else if (msEvent.state === 'FLOWING') {
          this.ws.sendMessage({ id : 'playStart', cameraId : this.id });
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

        console.log("  [video] Subscribe returned => " + this.mediaId);

        return callback(null, sdpAnswer);
      }
    }
    catch (err) {
      console.log("  [video] MCS returned error => " + err);
      return callback(err);
    }
  };

  async stop () {
    console.log(' [stop] Releasing endpoints for ' + this.userId);

    try {
      await this.mcs.leave(this.meetingId, this.userId);
      if (this.shared) {
        sharedWebcams[this.id] = null;
      }
      this._candidatesQueue = null;
      return;
    }
    catch (err) {
      console.log(err);
      return;
    }
    return;

    //console.log(' [stop] Releasing webrtc endpoint for ' + id);

    //if (webRtcEndpoint) {
    //  webRtcEndpoint.release();
    //  webRtcEndpoint = null;
    //} else {
    //  console.log(" [webRtcEndpoint] PLEASE DONT TRY STOPPING THINGS TWICE");
    //}

    //if (shared) {
    //  console.log(' [stop] Webcam is shared, releasing ' + id);

    //  if (mediaPipelines[id]) {
    //    mediaPipelines[id].release();
    //  } else {
    //    console.log(" [mediaPipeline] PLEASE DONT TRY STOPPING THINGS TWICE");
    //  }

    //  delete mediaPipelines[id];
    //  delete sharedWebcams[id];
    //}

    //delete this.candidatesQueue;
  };
};
