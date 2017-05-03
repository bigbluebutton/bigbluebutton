import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import { FormattedMessage, FormattedDate } from 'react-intl';
import DeskshareContainer from '/imports/ui/components/deskshare/container.jsx';

export default class VideoDock extends Component {

  constructor(props) {
    super(props);

    this.state = {
      ws: new ReconnectingWebSocket('wss://10.46.52.212:8443/html5video'),
      webRtcPeers: {},
    };

    this.handleIdChange = this.handleIdChange.bind(this);
    this.shareWebcam = this.shareWebcam.bind(this);
    this.receiveWebcam = this.receiveWebcam.bind(this);
  }

  componentDidMount() {
    let ws = this.state.ws;

    ws.addEventListener("message", (msg) => {
      var parsedMessage = JSON.parse(msg.data);

      console.debug('Received message new ws message: ');
      console.debug(parsedMessage);

      switch (parsedMessage.id) {

        case 'startResponse':
          this.startResponse(parsedMessage);
          break;

        case 'error':
          this.handleError(parsedMessage);
          break;

        case 'playStart':
          this.handlePlayStart(parsedMessage);
          break;

        case 'playStop':
          this.handlePlayStop();

          break;

        case 'iceCandidate':

          let webRtcPeer = this.state.webRtcPeers[parsedMessage.cameraId];

          if (webRtcPeer !== null) {
            webRtcPeer.addIceCandidate(parsedMessage.candidate, function (err) {
              if (err) {
                return console.error('Error adding candidate: ' + err);
              }
            });

          } else {

            console.error(' [ICE] Message arrived before webRtcPeer?');
          }

          break;

      }
    });
  }

  start(id, shareWebcam, videoInput, videoOutput) {

    let that = this;

    let ws = this.state.ws;

    console.log('Starting video call for video: ' + id);
    console.log('Creating WebRtcPeer and generating local sdp offer ...');

    let onIceCandidate = function(candidate) {
      let message = {
        id : 'onIceCandidate',
        candidate : candidate,
        cameraId: id
      };
      that.sendMessage(message);
    };

    let options = {
      localVideo: videoInput,
      remoteVideo: videoOutput,
      mediaConstraints : { audio: false, video: true },
      onicecandidate : onIceCandidate
    }

    let peerObj;
    if (shareWebcam) {
      peerObj = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly;
    } else {
      peerObj = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;
    }

    this.state.webRtcPeers[id] = peerObj(options, function(error) {

      if(error) {
        console.error(' [ERROR] Webrtc error');
        return;
      }

      this.generateOffer(function(error, offerSdp) {
        if(error) {
          return console.error(error);
        }

        console.info('Invoking SDP offer callback function ' + location.host);
        let message = {
          id : 'start',
          sdpOffer : offerSdp,
          cameraId: id,
          cameraShared: shareWebcam
        }
        that.sendMessage(message);
      })
    });

  }

  shareWebcam() {
    this.start(this.state.id, true, this.refs.videoInput, this.refs.videoOutput);
  }

  receiveWebcam() {
    this.start(this.state.id, false, this.refs.videoInput, this.refs.videoOutput);
  }

  startResponse(message) {

    let id = message.cameraId;
    let webRtcPeer = this.state.webRtcPeers[id];

    if (message.sdpAnswer == null) {
      return console.debug('Null sdp answer. Camera unplugged?');
    }

    if (webRtcPeer == null) {
      return console.debug('Null webrtc peer ????');
    }

    console.log('SDP answer received from server. Processing ...');

    webRtcPeer.processAnswer(message.sdpAnswer, function(error) {
      if (error) {
        return console.error(error);
      }
    });
  }

  sendMessage(message) {
    let ws = this.state.ws;

    var jsonMessage = JSON.stringify(message);
    console.log('Sending message: ' + jsonMessage);
    ws.send(jsonMessage, function(error) {
      if(error) {
        console.error('client: Websocket error "' + error + '" on message "' + jsonMessage.id + '"');
      }
    });
  }

  handlePlayStop(message) {
    console.log("Handle play stop <--------------------");
  }

  handlePlayStart(message) {
    console.log("Handle play start <===================");
  }

  handleError(message) {
    console.log(" Handle error ---------------------> " + message.message)
  }

  handleIdChange(e) {
    this.setState({ id: e.target.value });
  }

  render() {
    return (
      <div>
        <input type="button" id="shareWebcam" value="Share" onClick={this.shareWebcam} />
        <input type="button" id="receiveWebcam" value="Receive" onClick={this.receiveWebcam} />
        <input type="text" id="webcamId" onChange={this.handleIdChange} />

        <video id="videoInput" autoPlay width="120px" height="90px"  ref="videoInput"></video>
        <video id="videoOutput" autoPlay width="120px" height="90px" ref="videoOutput"></video>
      </div>
    );
  }
}
