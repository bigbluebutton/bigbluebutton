import React, { Component } from 'react';
import ScreenshareContainer from '/imports/ui/components/screenshare/container';
import styles from './styles';
import { log } from '/imports/ui/services/api';



class VideoElement extends Component {
  constructor(props) {
    super(props);
  }
}

export default class VideoDock extends Component {

  constructor(props) {
    super(props);

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(Meteor.settings.public.kurento.wsUrl);
    this.wsQueue = [];
    this.webRtcPeers = {};

    this.sendUserShareWebcam = props.sendUserShareWebcam.bind(this);
    this.sendUserUnshareWebcam = props.sendUserUnshareWebcam.bind(this);

    this.unshareWebcam = this.unshareWebcam.bind(this);
    this.shareWebcam = this.shareWebcam.bind(this);
  }

  componentDidMount() {
    const ws = this.ws;
    const { users } = this.props;
    for (let i = 0; i < users.length; i++) {
      if (users[i].has_stream) {
        this.start(users[i].userId, false, this.refs.videoInput);
      }
    }

    document.addEventListener('joinVideo', this.shareWebcam.bind(this));// TODO find a better way to do this
    document.addEventListener('exitVideo', this.unshareWebcam.bind(this));

    window.addEventListener('resize', this.adjustVideos);

    ws.addEventListener('message', this.onWsMessage.bind(this));
  }

  componentWillMount () {
    this.ws.onopen = () => {
      while (this.wsQueue.length > 0) {
        this.sendMessage(this.wsQueue.pop());
      }
    };
  }

  componentWillUnmount () {
    document.removeEventListener('joinVideo', this.shareWebcam);
    document.removeEventListener('exitVideo', this.shareWebcam);
    window.removeEventListener('resize', this.adjustVideos);
    this.ws.removeEventListener('message', this.onWsMessage);
  }

  adjustVideos () {
    window.adjustVideos('webcamArea', true);
  }

  onWsMessage (msg) {
    const parsedMessage = JSON.parse(msg.data);

    console.log('Received message new ws message: ');
    console.log(parsedMessage);

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
        this.handlePlayStop(parsedMessage);

        break;

      case 'iceCandidate':

        const webRtcPeer = this.webRtcPeers[parsedMessage.cameraId];

        if (webRtcPeer !== null) {
          if (webRtcPeer.didSDPAnswered) {
            webRtcPeer.addIceCandidate(parsedMessage.candidate, (err) => {
              if (err) {
                return log('error', `Error adding candidate: ${err}`);
              }
            });
          } else {
            webRtcPeer.iceQueue.push(parsedMessage.candidate);
          }
        } else {
          log('error', ' [ICE] Message arrived before webRtcPeer?');
        }
        break;
    }
  };

  start(id, shareWebcam, videoInput) {
    const that = this;

    const ws = this.ws;

    console.log(`Starting video call for video: ${id}`);
    log('info', 'Creating WebRtcPeer and generating local sdp offer ...');

    const onIceCandidate = function (candidate) {
      const message = {
        type: 'video',
        role: shareWebcam? 'share' : 'viewer',
        id: 'onIceCandidate',
        candidate,
        cameraId: id,
      };
      that.sendMessage(message);
    };

    var videoConstraints = {};
    if (!!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) { // Custom constraints for Safari
      videoConstraints = {
        width: {min:320, max:640},
        height: {min:240, max:480}
      }
    } else {
      videoConstraints = {
        width: {min: 320, ideal: 320},
        height: {min: 240, ideal:240},
        frameRate: {min: 5, ideal: 10}
      };
    }

    const options = {
      mediaConstraints: {
        audio: false,
        video: videoConstraints
      },
      onicecandidate: onIceCandidate,
    };

    let peerObj;
    if (shareWebcam) {
      options.localVideo = videoInput;
      peerObj = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly;
    } else {
      peerObj = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;

      options.remoteVideo = document.createElement('video');
      options.remoteVideo.id = `video-elem-${id}`;
      options.remoteVideo.width = 120;
      options.remoteVideo.height = 90;
      options.remoteVideo.autoplay = true;
      options.remoteVideo.playsinline = true;
      options.remoteVideo.muted = true;

      document.getElementById('webcamArea').appendChild(options.remoteVideo);
    }

    this.webRtcPeers[id] = new peerObj(options, function (error) {
      if (error) {
        log('error', ' [ERROR] Webrtc error');
        log('error', error);
        return;
      }

      this.didSDPAnswered = false;
      this.iceQueue = [];

      if (shareWebcam) {
        that.sharedWebcam = that.webRtcPeers[id];
        that.myId = id;
      }

      this.generateOffer((error, offerSdp) => {
        if (error) {
          return log('error', error);
        }

        console.log(`Invoking SDP offer callback function ${location.host}`);
        const message = {
          type: 'video',
          role: shareWebcam? 'share' : 'viewer',
          id: 'start',
          sdpOffer: offerSdp,
          cameraId: id,
          cameraShared: shareWebcam,
        };
        that.sendMessage(message);
      });
      while (this.iceQueue.length) {
        var candidate = this.iceQueue.shift();
        this.addIceCandidate(candidate, (err) => {
          if (err) {
            return console.error(`Error adding candidate: ${err}`);
          }
        });
      }
      this.didSDPAnswered = true;
    });
  }

  stop(id) {
    const { users } = this.props;
    if (id == users[0].userId) {
      this.unshareWebcam();
    }
    const webRtcPeer = this.webRtcPeers[id];

    if (webRtcPeer) {
      log('info', 'Stopping WebRTC peer');

      if (id == this.myId) {
        this.sharedWebcam.dispose();
        this.sharedWebcam = null;
      }

      webRtcPeer.dispose();
      delete this.webRtcPeers[id];
    } else {
      log('info', 'NO WEBRTC PEER TO STOP?');
    }

    const videoTag = document.getElementById(`video-elem-${id}`);
    if (videoTag) {
      document.getElementById('webcamArea').removeChild(videoTag);
    }

    this.sendMessage({
      type: 'video',
      role: 'any',
      id: 'stop',
      cameraId: id });

    window.adjustVideos('webcamArea', true);
  }

  shareWebcam() {
    const { users } = this.props;
    const id = users[0].userId;

    this.start(id, true, this.refs.videoInput);
  }

  unshareWebcam() {
    log('info', "Unsharing webcam");
    const { users } = this.props;
    const id = users[0].userId;
    this.sendUserUnshareWebcam(id);
  }

  startResponse(message) {
    const id = message.cameraId;
    const webRtcPeer = this.webRtcPeers[id];

    if (message.sdpAnswer == null) {
      return log('debug', 'Null sdp answer. Camera unplugged?');
    }

    if (webRtcPeer == null) {
      return log('debug', 'Null webrtc peer ????');
    }

    log('info', 'SDP answer received from server. Processing ...');

    webRtcPeer.processAnswer(message.sdpAnswer, (error) => {
      if (error) {
        return log(error);
      }
    });

    this.sendUserShareWebcam(id);
  }

  sendMessage(message) {
    const ws = this.ws;

    if (ws.readyState == WebSocket.OPEN) {
      const jsonMessage = JSON.stringify(message);
      console.log(`Sending message: ${jsonMessage}`);
      ws.send(jsonMessage, (error) => {
        if (error) {
          console.error(`client: Websocket error "${error}" on message "${jsonMessage.id}"`);
        }
      });
    } else {
      this.wsQueue.push(message);
    }
  }

  handlePlayStop(message) {
    log('info', 'Handle play stop <--------------------');

    this.stop(message.cameraId);
  }

  handlePlayStart(message) {
    log('info', 'Handle play start <===================');

    window.adjustVideos('webcamArea', true);
  }

  handleError(message) {
    console.error(` Handle error ---------------------> ${message.message}`);
  }

  render() {
    return (

      <div className={styles.videoDock}>
        <div id="webcamArea" />
        <video id="shareWebcamVideo" className={styles.sharedWebcamVideo} ref="videoInput" />
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { users } = this.props;
    const nextUsers = nextProps.users;

    if (users) {
      let suc = false;

      for (let i = 0; i < users.length; i++) {
        if (users && users[i] &&
              nextUsers && nextUsers[i]) {
          if (users[i].has_stream !== nextUsers[i].has_stream) {
            console.log(`User ${nextUsers[i].has_stream ? '' : 'un'}shared webcam ${users[i].userId}`);

            if (nextUsers[i].has_stream) {
              this.start(users[i].userId, false, this.refs.videoInput);
            } else {
              this.stop(users[i].userId);
            }

            suc = suc || true;
          }
        }
      }

      return true;
    }

    return false;
  }
}
