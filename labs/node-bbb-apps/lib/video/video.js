'use strict';
// Global stuff
var mediaPipelines = {};
var sharedWebcams = {};

// TODO Later
// var loadBalancer = require('')
const kurento = require('kurento-client');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const MCSApi = require('../mcs-core/lib/media/MCSApiStub');

if (config.get('acceptSelfSignedCertificate')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
}

var kurentoClient = null;

function getKurentoClient(callback) {

  if (kurentoClient !== null) {
    return callback(null, kurentoClient);
  }

  kurento(kurentoUrl, function(error, _kurentoClient) {
    if (error) {
      console.log("Could not find media server at address " + kurentoUrl);
      return callback("Could not find media server at address" + kurentoUrl + ". Exiting with error " + error);
    }

    console.log(" [server] Initiating kurento client. Connecting to: " + kurentoUrl);

    kurentoClient = _kurentoClient;
    callback(null, kurentoClient);
  });
}

function getMediaPipeline(id, callback) {

  console.log(' [media] Creating media pipeline for ' + id);

  if (mediaPipelines[id]) {

    console.log(' [media] Pipeline already exists.');

    callback(null, mediaPipelines[id]);

  } else {

    kurentoClient.create('MediaPipeline', function(err, pipeline) {

      mediaPipelines[id] = pipeline;

      return callback(err, pipeline);
    });

  }

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
    console.log("  [video] Got ICE candidate");

    //if (webRtcEndpoint) {
    //  webRtcEndpoint.addIceCandidate(candidate);
    //}
    //else {
    //  candidatesQueue.push(candidate);
    //}

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
        } else if (msEvent.state === 'FLOWING') {
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

        console.log("  [video] Publish returned => ");
        console.log(this.mediaId);

        return callback(null, sdpAnswer);
      }
      else {
        const ret  = await this.mcs.subscribe(this.userId, 'WebRtcEndpoint', sharedWebcams[this.id], {descriptor: sdpOffer});
        this.mediaId = ret.sessionId;
        sdpAnswer = ret.answer;
        this.flushCandidatesQueue();
        this.mcs.on('MediaEvent' + this.mediaId, this.mediaState.bind(this));

        console.log("  [video] Subscribe returned => ");
        console.log(this.mediaId);


        return callback(null, sdpAnswer);

      }
    }
    catch (err) {
      console.log("  [video] MCS returned error => " + err);
      return callback(err);
    }

    //getKurentoClient(function(error, kurentoClient) {

    //  if (error) {
    //    return callback(error);
    //  }

    //  getMediaPipeline(id, function(error, pipeline) {

    //    if (error) {
    //      return callback(error);
    //    }

    //    createMediaElements(pipeline, function(error, _webRtcEndpoint) {

    //      if (error) {
    //        pipeline.release();
    //        return callback(error);
    //      }

    //      while(candidatesQueue.length) {
    //        let candidate = candidatesQueue.shift();
    //        _webRtcEndpoint.addIceCandidate(candidate);
    //      }

    //      var flowInOut = function(event) {
    //        console.log(' [=] ' + event.type + ' for endpoint ' + id);

    //        if (event.state === 'NOT_FLOWING') {
    //          ws.sendMessage({ id : 'playStop', cameraId : id });
    //        } else if (event.state === 'FLOWING') {
    //          ws.sendMessage({ id : 'playStart', cameraId : id });
    //        }
    //      };

    //      _webRtcEndpoint.on('MediaFlowInStateChange', flowInOut);
    //      _webRtcEndpoint.on('MediaFlowOutStateChange', flowInOut);

    //      connectMediaElements(_webRtcEndpoint, function(error) {

    //        if (error) {
    //          pipeline.release();
    //          return callback(error);
    //        }

    //        // It's a user sharing a webcam
    //        if (shared) {
    //          sharedWebcams[id] = _webRtcEndpoint;
    //        }

    //        // Store our endpoint
    //        webRtcEndpoint = _webRtcEndpoint;

    //        _webRtcEndpoint.on('OnIceCandidate', function(event) {
    //          let candidate = kurento.getComplexType('IceCandidate')(event.candidate);
    //          ws.sendMessage({ id : 'iceCandidate', cameraId: id, candidate : candidate });
    //        });

    //        _webRtcEndpoint.processOffer(sdpOffer, function(error, sdpAnswer) {
    //          if (error) {
    //            pipeline.release();
    //            return callback(error);
    //          }

    //          return callback(null, sdpAnswer);
    //        });

    //        _webRtcEndpoint.gatherCandidates(function(error) {
    //          if (error) {
    //            return callback(error);
    //          }
    //        });
    //      });
    //    });
    //  });
    //});
  };

  createMediaElements (pipeline, callback) {

    console.log(" [webrtc] Creating webrtc endpoint");

    pipeline.create('WebRtcEndpoint', function(error, _webRtcEndpoint) {

      if (error) {
        return callback(error);
      }

      webRtcEndpoint = _webRtcEndpoint;

      return callback(null, _webRtcEndpoint);
    });
  };

  connectMediaElements (webRtcEndpoint, callback) {

    // User is sharing webcam (sendOnly connection from the client)
    if (shared) {
      console.log(" [webrtc] User has shared the webcam, no connection needed");
      // Dont connect this, just create the webrtcEndpoint
      // webRtcEndpoint.connect(webRtcEndpoint, callback);

      return callback(null);
    } else {

      console.log(" [webrtc] User wants to receive webcam ");

      if (sharedWebcams[id]) {
        let wRtc = sharedWebcams[id];

        wRtc.connect(webRtcEndpoint, function(error) {

          if (error) {
            return callback(error);
          }
          return callback(null);
        });
      }

    }
  };

  stop () {

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
