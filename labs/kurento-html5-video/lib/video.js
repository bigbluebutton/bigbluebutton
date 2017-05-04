// Global stuff
var mediaPipelines = {};
var sharedWebcams = {};

// TODO Later
// var loadBalancer = require('')
const kurento = require('kurento-client');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');

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

function Video(_ws, _id, _shared) {

  var ws = _ws;
  var id = _id;
  var shared = _shared;
  var webRtcEndpoint = null;

  var candidatesQueue = [];

  this.onIceCandidate = function(_candidate) {
    var candidate = kurento.getComplexType('IceCandidate')(_candidate);

    if (webRtcEndpoint) {
      webRtcEndpoint.addIceCandidate(candidate);
    }
    else {
      candidatesQueue.push(candidate);
    }
  };

  this.start = function(sdpOffer, callback) {

    getKurentoClient(function(error, kurentoClient) {

      if (error) {
        return callback(error);
      }

      getMediaPipeline(id, function(error, pipeline) {

        if (error) {
          return callback(error);
        }

        createMediaElements(pipeline, function(error, _webRtcEndpoint) {

          if (error) {
            pipeline.release();
            return callback(error);
          }

          while(candidatesQueue.length) {
            var candidate = candidatesQueue.shift();
            _webRtcEndpoint.addIceCandidate(candidate);
          }

          connectMediaElements(_webRtcEndpoint, function(error) {

            if (error) {
              pipeline.release();
              return callback(error);
            }

            // It's a user sharing a webcam
            if (shared) {
              sharedWebcams[id] = _webRtcEndpoint;
            }

            // Store our endpoint
            webRtcEndpoint = _webRtcEndpoint;

            _webRtcEndpoint.on('MediaStateChanged', function(event) {
              console.log('  [webrtc] MediaStateChanged from [' + event.oldState + ']' + ' to [' + event.newState + '], mediaSourceId = ' + id);

              if (event.newState === 'CONNECTED') {
                ws.sendMessage({ id : 'playStart', cameraId : id });
              } else {
                ws.sendMessage({ id : 'playStop', cameraId : id });
              }

            });

            _webRtcEndpoint.on('OnIceCandidate', function(event) {
              var candidate = kurento.getComplexType('IceCandidate')(event.candidate);
              ws.sendMessage({ id : 'iceCandidate', cameraId: id, candidate : candidate });
            });

            _webRtcEndpoint.processOffer(sdpOffer, function(error, sdpAnswer) {
              if (error) {
                pipeline.release();
                return callback(error);
              }

              return callback(null, sdpAnswer);
            });

            _webRtcEndpoint.gatherCandidates(function(error) {
              if (error) {
                return callback(error);
              }
            });
          });
        });
      });
    });
  };

  var createMediaElements = function(pipeline, callback) {

    console.log(" [webrtc] Creating webrtc endpoint");

    pipeline.create('WebRtcEndpoint', function(error, _webRtcEndpoint) {

      if (error) {
        return callback(error);
      }

      webRtcEndpoint = _webRtcEndpoint;

      return callback(null, _webRtcEndpoint);
    });
  };

  var connectMediaElements = function(webRtcEndpoint, callback) {

    // User is sharing webcam (sendOnly connection from the client)
    if (shared) {
      console.log(" [webrtc] User has shared the webcam, no connection needed");
      // Dont connect this, just create the webrtcEndpoint
      // webRtcEndpoint.connect(webRtcEndpoint, callback);

      return callback(null);
    } else {

      console.log(" [webrtc] User wants to receive webcam ");

      if (sharedWebcams[id]) {
        var wRtc = sharedWebcams[id];

        wRtc.connect(webRtcEndpoint, function(error) {

          if (error) {
            return callback(error);
          }
          return callback(null);
        });
      }

    }
  };

  this.stop = function() {

    if (!mediaPipelines[id]) {
      console.log("PLEASE DONT TRY STOPPING THINGS TWICE");
    }

    console.log(' [stop] Releasing webrtc endpoint for ' + id);
    webRtcEndpoint.release();

    if (shared) {
      console.log(' [stop] Webcam is shared, releasing ' + id);
      mediaPipelines[id].release();

      delete mediaPipelines[id];
      delete sharedWebcams[id];
    }

    delete candidatesQueue;
  };

  return this;
};

module.exports = Video;