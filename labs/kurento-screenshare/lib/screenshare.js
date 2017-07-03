/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

// Imports
var Constants = require('./bbb/messages/Constants');
var MediaHandler = require('./media-handler');
var Messaging = require('./bbb/messages/Messaging');
var moment = require('moment');
var h264_sdp = require('./h264-sdp');
var now = moment();

// Global stuff
var mediaPipelines = {};
var sharedScreens = {};
var rtpEndpoints = {};

const kurento = require('kurento-client');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const kurentoIp = config.get('kurentoIp');
const localIpAddress = config.get('localIpAddress');

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

function Screenshare(_ws, _id, _bbbgw, _voiceBridge, _caller, _vh, _vw) {
  var ws = _ws;
  var id = _id;
  var BigBlueButtonGW = _bbbgw;
  var webRtcEndpoint = null;
  var rtpEndpoint = null;
  var voiceBridge = _voiceBridge;
  var caller = _caller;
  var streamUrl = "";
  var vw = _vw;
  var vh = _vh;

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


  // TODO this method could use a refactor
  this.startPresenter = function(id, ws, sdpOffer, callback) {
    var self = this;
    var theCallback = callback;

    // Force H264 on Firefox and Chrome
    sdpOffer = h264_sdp.transform(sdpOffer);
    console.log("Starting presenter for " + sdpOffer);

    MediaHandler.getKurentoClient(function(error, kurentoClient) {
      if (error) {
        console.log("Kurento client error " + error);
        return theCallback(error);
      }

      MediaHandler.getMediaPipeline(id, function(error, pipeline) {
        if (error) {
          console.log("Media pipeline client error" + error);
          return theCallback(error);
        }

        createMediaElements(pipeline, function(error, _webRtcEndpoint, _rtpEndpoint) {
          if (error) {
            console.log("Media elements error" + error);
            pipeline.release();
            return theCallback(error);
          }

          while(candidatesQueue.length) {
            var candidate = candidatesQueue.shift();
            _webRtcEndpoint.addIceCandidate(candidate);
          }

          connectMediaElements(_webRtcEndpoint, _rtpEndpoint, function(error) {
            if (error) {
              console.log("Media elements CONNECT error" + error);
              pipeline.release();
              return theCallback(error);
            }

            // It's a user sharing a Screen
            sharedScreens[id] = _webRtcEndpoint;
            rtpEndpoints[id] = _rtpEndpoint;

            // Store our endpoint
            webRtcEndpoint = _webRtcEndpoint;
            rtpEndpoint = _rtpEndpoint;

            _webRtcEndpoint.on('OnIceCandidate', function(event) {
              var candidate = kurento.getComplexType('IceCandidate')(event.candidate);
              ws.sendMessage({ id : 'iceCandidate', cameraId: id, candidate : candidate });
            });

            _webRtcEndpoint.processOffer(sdpOffer, function(error, webRtcSdpAnswer) {
              if (error) {
                console.log("  [webrtc] processOffer error => " + error + "for SDP " + sdpOffer);
                pipeline.release();
                return theCallback(error);
              }

              sendVideoPort = MediaHandler.getVideoPort();

              var rtpSdpOffer = MediaHandler.generateVideoSdp(localIpAddress, sendVideoPort);
              console.log("  [rtpendpoint] RtpEndpoint processing => " + rtpSdpOffer);

              _webRtcEndpoint.gatherCandidates(function(error) {
                if (error) {
                  return theCallback(error);
                }

                _rtpEndpoint.processOffer(rtpSdpOffer, function(error, rtpSdpAnswer) {
                  if (error) {
                    console.log("  [rtpendpoint] processOffer error => " + error + "for SDP " + rtpSdpOffer);
                    pipeline.release();
                    return theCallback(error);
                  }

                  console.log("  [rtpendpoint] KMS answer SDP => " + rtpSdpAnswer);
                  var recvVideoPort = rtpSdpAnswer.match(/m=video\s(\d*)/)[1];
                  var rtpParams = MediaHandler.generateTranscoderParams(kurentoIp, localIpAddress,
                      sendVideoPort, recvVideoPort, voiceBridge, "stream_type_video", Constants.RTP_TO_RTMP, "copy", "caller");
                  console.log(" RTP PARAMS => " + JSON.stringify(rtpParams, null, 2));

                  _rtpEndpoint.on('MediaFlowInStateChange', function(event) {
                    if (event.state === 'NOT_FLOWING') {
                      onRtpMediaNotFlowing();
                    }
                    else if (event.state === 'FLOWING') {
                      onRtpMediaFlowing(voiceBridge, rtpParams);
                    }
                  });
                  return theCallback(null, webRtcSdpAnswer);
                });
              });
            });
          });
        });
      });
    });
  };

  var createMediaElements = function(pipeline, callback) {
    console.log(" [webrtc] Creating webrtc and rtp endpoints");
    pipeline.create('WebRtcEndpoint', function(error, _webRtcEndpoint) {
      if (error) {
        return callback(error);
      }
      webRtcEndpoint = _webRtcEndpoint;
      pipeline.create('RtpEndpoint', function(error, _rtpEndpoint) {

        if (error) {
          return callback(error);
        }
        rtpEndpoint = _rtpEndpoint;
        return callback(null, _webRtcEndpoint, _rtpEndpoint);
      });
    });
  };

  var connectMediaElements = function(webRtcEndpoint, rtpEndpoint, callback) {
    // User is sharing Screen (sendOnly connection from the client)
    console.log(" [webrtc] User wants to receive Screen ");
    webRtcEndpoint.connect(rtpEndpoint, function(error) {

      if (error) {
        return callback(error);
      }
      return callback(null);
    });
  };

  this.stop = function() {

    console.log(' [stop] Releasing endpoints for ' + id);

    this.stopScreensharing();

    if (webRtcEndpoint) {
      webRtcEndpoint.release();
      webRtcEndpoint = null;
    } else {
      console.log(" [webRtcEndpoint] PLEASE DONT TRY STOPPING THINGS TWICE");
    }

    if (rtpEndpoint) {
      rtpEndpoint.release();
      rtpEndpoint = null;
    } else {
      console.log(" [rtpEndpoint] PLEASE DONT TRY STOPPING THINGS TWICE");
    }

    console.log(' [stop] Screen is shared, releasing ' + id);

    if (mediaPipelines[id]) {
      mediaPipelines[id].release();
    } else {
      console.log(" [mediaPipeline] PLEASE DONT TRY STOPPING THINGS TWICE");
    }

    delete mediaPipelines[id];
    delete sharedScreens[id];

    delete candidatesQueue;
  };

  this.stopScreensharing = function () {
    var strm = Messaging.generateStopTranscoderRequestMessage(voiceBridge, voiceBridge);
    BigBlueButtonGW.publish(strm, Constants.TO_BBB_TRANSCODE_SYSTEM_CHAN, function(error) {});

    BigBlueButtonGW.on(Constants.STOP_TRANSCODER_REPLY, function(payload) {
      var meetingId = payload[Constants.MEETING_ID];
      var transcoderId = payload[Constants.TRANSCODER_ID];
      if(voiceBridge === meetingId) {
        // TODO correctly assemble this timestamp
        var timestamp = now.format('hhmmss');
        var dsrstom = Messaging.generateDeskShareRTMPBroadcastStoppedEvent(voiceBridge,
            streamUrl, vw, vh, timestamp);
        BigBlueButtonGW.publish(dsrstom, Constants.FROM_VOICE_CONF_SYSTEM_CHAN, function(error) {});
      }
    });
  }

  var onRtpMediaFlowing = function(voiceBridge, rtpParams) {
    var strm = Messaging.generateStartTranscoderRequestMessage(voiceBridge, voiceBridge, rtpParams);
    BigBlueButtonGW.on(Constants.START_TRANSCODER_REPLY, function(payload) {
      var meetingId = payload[Constants.MEETING_ID];
      var transcoderId = payload[Constants.TRANSCODER_ID];
      if(voiceBridge === meetingId) {
        var output = payload["params"].output;
        streamUrl = MediaHandler.generateStreamUrl(localIpAddress, voiceBridge, output);
        console.log("  [screenshare] STREAM URL " + streamUrl);
        // TODO correctly assemble this timestamp
        var timestamp = now.format('hhmmss');
        var dsrbstam = Messaging.generateDeskShareRTMPBroadcastStartedEvent(voiceBridge, streamUrl, vw, vh, timestamp);
        BigBlueButtonGW.publish(dsrbstam, Constants.FROM_VOICE_CONF_SYSTEM_CHAN, function(error) {});
      }
    });
    BigBlueButtonGW.publish(strm, Constants.TO_BBB_TRANSCODE_SYSTEM_CHAN, function(error) {});
  };

  var onRtpMediaNotFlowing = function() {
    console.log("  [screenshare] TODO RTP NOT_FLOWING");
  };

  return this;
};

module.exports = Screenshare;
