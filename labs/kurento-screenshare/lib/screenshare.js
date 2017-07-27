/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict'

// Imports
const C = require('./bbb/messages/Constants');
const MediaHandler = require('./media-handler');
const Messaging = require('./bbb/messages/Messaging');
const moment = require('moment');
const h264_sdp = require('./h264-sdp');
const now = moment();
const MediaController = require('./media-controller');

// Global stuff
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

module.exports = class Screenshare {
  constructor(ws, id, bbbgw, voiceBridge, caller, vh, vw) {
    this._ws = ws;
    this._id = id;
    this._BigBlueButtonGW = bbbgw;
    this._webRtcEndpoint = null;
    this._rtpEndpoint = null;
    this._voiceBridge = voiceBridge;
    this._caller = caller;
    this._streamUrl = "";
    this._vw = vw;
    this._vh = vh;
    this._candidatesQueue = [];
  }

  // TODO isolate ICE
  _onIceCandidate(_candidate) {
    let candidate = kurento.getComplexType('IceCandidate')(_candidate);

    if (this._webRtcEndpoint) {
      this._webRtcEndpoint.addIceCandidate(candidate);
    }
    else {
      this._candidatesQueue.push(candidate);
    }
  };

  _startPresenter(id, ws, sdpOffer, callback) {
    let self = this;
    let _callback = callback;

    // Force H264 on Firefox and Chrome
    sdpOffer = h264_sdp.transform(sdpOffer);
    console.log("Starting presenter for " + sdpOffer);
    MediaController.createMediaElement(self._voiceBridge, C.WebRTC, function(error, webRtcEndpoint) {
      if (error) {
        console.log("Media elements error" + error);
        return _callback(error);
      }
      MediaController.createMediaElement(self._voiceBridge, C.RTP, function(error, rtpEndpoint) {
        if (error) {
          console.log("Media elements error" + error);
          return _callback(error);
        }


        while(self._candidatesQueue.length) {
          let candidate = self._candidatesQueue.shift();
          MediaController.addIceCandidate(webRtcEndpoint.id, candidate);
        }

        MediaController.connectMediaElements(webRtcEndpoint.id, rtpEndpoint.id, C.VIDEO, function(error) {
          if (error) {
            console.log("Media elements CONNECT error " + error);
            //pipeline.release();
            return _callback(error);
          }

          // It's a user sharing a Screen
          sharedScreens[id] = webRtcEndpoint;
          rtpEndpoints[id] = rtpEndpoint;

          // Store our endpoint
          self._webRtcEndpoint = webRtcEndpoint;
          self._rtpEndpoint = rtpEndpoint;

          self._webRtcEndpoint.on('OnIceCandidate', function(event) {
            let candidate = kurento.getComplexType('IceCandidate')(event.candidate);
            ws.sendMessage({ id : 'iceCandidate', cameraId: id, candidate : candidate });
          });

          MediaController.processOffer(webRtcEndpoint.id, sdpOffer, function(error, webRtcSdpAnswer) {
            if (error) {
              console.log("  [webrtc] processOffer error => " + error + " for SDP " + sdpOffer);
              //pipeline.release();
              return _callback(error);
            }

            let sendVideoPort = MediaHandler.getVideoPort();

            let rtpSdpOffer = MediaHandler.generateVideoSdp(localIpAddress, sendVideoPort);
            console.log("  [rtpendpoint] RtpEndpoint processing => " + rtpSdpOffer);

            MediaController.gatherCandidates(webRtcEndpoint.id, function(error) {
              if (error) {
                return _callback(error);
              }

              MediaController.processOffer(rtpEndpoint.id, rtpSdpOffer, function(error, rtpSdpAnswer) {
                if (error) {
                  console.log("  [rtpendpoint] processOffer error => " + error + " for SDP " + rtpSdpOffer);
                  //pipeline.release();
                  return _callback(error);
                }

                console.log("  [rtpendpoint] KMS answer SDP => " + rtpSdpAnswer);
                let recvVideoPort = rtpSdpAnswer.match(/m=video\s(\d*)/)[1];
                let rtpParams = MediaHandler.generateTranscoderParams(kurentoIp, localIpAddress,
                    sendVideoPort, recvVideoPort, self._voiceBridge, "stream_type_video", C.RTP_TO_RTMP, "copy", "caller");

                self._rtpEndpoint.on('MediaFlowInStateChange', function(event) {
                  if (event.state === 'NOT_FLOWING') {
                    self._onRtpMediaNotFlowing();
                  }
                  else if (event.state === 'FLOWING') {
                    self._onRtpMediaFlowing(self._voiceBridge, rtpParams);
                  }
                });
                return _callback(null, webRtcSdpAnswer);
              });
            });
          });
        });
      });
    });
  };

  _stop() {

    console.log(' [stop] Releasing endpoints for ' + this._id);

    this._stopScreensharing();

    if (this._webRtcEndpoint) {
      MediaController.releaseMediaElement(this._webRtcEndpoint.id);
      this._webRtcEndpoint = null;
    } else {
      console.log(" [webRtcEndpoint] PLEASE DONT TRY STOPPING THINGS TWICE");
    }

    if (this._rtpEndpoint) {
      MediaController.releaseMediaElement(this._rtpEndpoint.id);
      this._rtpEndpoint = null;
    } else {
      console.log(" [rtpEndpoint] PLEASE DONT TRY STOPPING THINGS TWICE");
    }

    console.log(' [stop] Screen is shared, releasing ' + this._id);

    delete sharedScreens[this._id];

    delete this._candidatesQueue;
  };

  _stopScreensharing() {
    let self = this;
    let strm = Messaging.generateStopTranscoderRequestMessage(this._voiceBridge, this._voiceBridge);

    self._BigBlueButtonGW.publish(strm, C.TO_BBB_TRANSCODE_SYSTEM_CHAN, function(error) {});

    self._BigBlueButtonGW.once(C.STOP_TRANSCODER_REPLY, function(payload) {
      let meetingId = payload[C.MEETING_ID];
      let transcoderId = payload[C.TRANSCODER_ID];

      if(self._voiceBridge === meetingId) {
        // TODO correctly assemble this timestamp
        let timestamp = now.format('hhmmss');
        let dsrstom = Messaging.generateScreenshareRTMPBroadcastStoppedEvent2x(self._voiceBridge,
            self._voiceBridge, self._streamUrl, self._vw, self._vh, timestamp);
        self._BigBlueButtonGW.publish(dsrstom, C.FROM_VOICE_CONF_SYSTEM_CHAN, function(error) {});
      }
    });
  }

  _onRtpMediaFlowing(voiceBridge, rtpParams) {
    let self = this;
    let strm = Messaging.generateStartTranscoderRequestMessage(voiceBridge, voiceBridge, rtpParams);

    self._BigBlueButtonGW.once(C.START_TRANSCODER_REPLY, function(payload) {
      let meetingId = payload[C.MEETING_ID];
      let transcoderId = payload[C.TRANSCODER_ID];

      if(voiceBridge === meetingId) {
        let output = payload["params"].output;
        // TODO correctly assemble this timestamp
        let timestamp = now.format('hhmmss');
        self._streamUrl = MediaHandler.generateStreamUrl(localIpAddress, voiceBridge, output);
        let dsrbstam = Messaging.generateScreenshareRTMPBroadcastStartedEvent2x(self._voiceBridge,
            self._voiceBridge, self._streamUrl, self._vw, self._vh, timestamp);

        self._BigBlueButtonGW.publish(dsrbstam, C.FROM_VOICE_CONF_SYSTEM_CHAN, function(error) {});
      }
    });

    self._BigBlueButtonGW.publish(strm, C.TO_BBB_TRANSCODE_SYSTEM_CHAN, function(error) {});
  };

  _onRtpMediaNotFlowing() {
    console.log("  [screenshare] TODO RTP NOT_FLOWING");
  };
};
