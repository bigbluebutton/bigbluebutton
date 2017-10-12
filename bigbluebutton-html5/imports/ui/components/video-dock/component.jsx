import React, { Component } from 'react';
import ScreenshareContainer from '/imports/ui/components/screenshare/container';
import styles from './styles.scss';

function adjustVideos(centerVideos) {
  const _minContentAspectRatio = 4 / 3.0;

  function calculateOccupiedArea(canvasWidth, canvasHeight, numColumns, numRows, numChildren) {
    const obj = calculateCellDimensions(canvasWidth, canvasHeight, numColumns, numRows);
    obj.occupiedArea = obj.width * obj.height * numChildren;
    obj.numColumns = numColumns;
    obj.numRows = numRows;
    obj.cellAspectRatio = _minContentAspectRatio;
    return obj;
  }

  function calculateCellDimensions(canvasWidth, canvasHeight, numColumns, numRows) {
    const obj = {
      width: Math.floor(canvasWidth / numColumns),
      height: Math.floor(canvasHeight / numRows),
    };

    if (obj.width / obj.height > _minContentAspectRatio) {
      obj.width = Math.min(Math.floor(obj.height * _minContentAspectRatio), Math.floor(canvasWidth / numColumns));
    } else {
      obj.height = Math.min(Math.floor(obj.width / _minContentAspectRatio), Math.floor(canvasHeight / numRows));
    }
    return obj;
  }

  function findBestConfiguration(canvasWidth, canvasHeight, numChildrenInCanvas) {
    let bestConfiguration = {
      occupiedArea: 0,
    };

    for (let cols = 1; cols <= numChildrenInCanvas; cols++) {
      let rows = Math.floor(numChildrenInCanvas / cols);

      // That's a small HACK, different from the original algorithm
      // Sometimes numChildren will be bigger than cols*rows, this means that this configuration
      // can't show all the videos and shouldn't be considered. So we just increment the number of rows
      // and get a configuration which shows all the videos albeit with a few missing slots in the end.
      //   For example: with numChildren == 8 the loop will generate cols == 3 and rows == 2
      //   cols * rows is 6 so we bump rows to 3 and then cols*rows is 9 which is bigger than 8
      if (numChildrenInCanvas > cols * rows) {
        rows += 1;
      }

      const currentConfiguration = calculateOccupiedArea(canvasWidth, canvasHeight, cols, rows, numChildrenInCanvas);

      if (currentConfiguration.occupiedArea > bestConfiguration.occupiedArea) {
        bestConfiguration = currentConfiguration;
      }
    }

    return bestConfiguration;
  }

  // http://stackoverflow.com/a/3437825/414642
  const e = $('#webcamArea').parent();
  const x = e.outerWidth() - 1;
  const y = e.outerHeight() - 1;

  const videos = $('#webcamArea video:visible');

  const best = findBestConfiguration(x, y, videos.length);

  videos.each(function (i) {
    const row = Math.floor(i / best.numColumns);
    const col = Math.floor(i % best.numColumns);

    // Free width space remaining to the right and below of the videos
    const remX = (x - best.width * best.numColumns);
    const remY = (y - best.height * best.numRows);

    // Center videos
    const top = Math.floor(((best.height) * row) + remY / 2);
    const left = Math.floor(((best.width) * col) + remX / 2);

    const videoTop = `top: ${top}px;`;
    const videoLeft = `left: ${left}px;`;

    $(this).attr('style', videoTop + videoLeft);
  });

  videos.attr('width', best.width);
  videos.attr('height', best.height);
}

window.addEventListener('resize', function() {
  adjustVideos(true);
});

export default class VideoDock extends Component {

  constructor(props) {
    super(props);

    this.state = {
      // Set a valid kurento application server socket in the settings
      ws: new ReconnectingWebSocket(Meteor.settings.public.kurento.wsUrl),
      webRtcPeers: {},
      wsQueue: [],
    };

    this.state.ws.onopen = () => {
      while (this.state.wsQueue.length > 0) {
        this.sendMessage(this.state.wsQueue.pop());
      }
    };

    this.sendUserShareWebcam = props.sendUserShareWebcam.bind(this);
    this.sendUserUnshareWebcam = props.sendUserUnshareWebcam.bind(this);

    this.unshareWebcam = this.unshareWebcam.bind(this);
    this.shareWebcam = this.shareWebcam.bind(this);
  }

  componentDidMount() {
    const that = this;
    const ws = this.state.ws;
    const { users } = this.props;

    for (let i = 0; i < users.length; i++) {
      if (users[i].has_stream) {
        this.start(users[i].userId, false, this.refs.videoInput);
      }
    }

    document.addEventListener('joinVideo', () => { that.shareWebcam(); });// TODO find a better way to do this
    document.addEventListener('exitVideo', () => { that.unshareWebcam(); });

    ws.addEventListener('message', (msg) => {
      const parsedMessage = JSON.parse(msg.data);

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
          this.handlePlayStop(parsedMessage);

          break;

        case 'iceCandidate':

          const webRtcPeer = this.state.webRtcPeers[parsedMessage.cameraId];

          if (webRtcPeer !== null) {
            webRtcPeer.addIceCandidate(parsedMessage.candidate, (err) => {
              if (err) {
                return console.error(`Error adding candidate: ${err}`);
              }
            });
          } else {
            console.error(' [ICE] Message arrived before webRtcPeer?');
          }

          break;

      }
    });
  }

  start(id, shareWebcam, videoInput) {
    const that = this;

    const ws = this.state.ws;

    console.log(`Starting video call for video: ${id}`);
    console.log('Creating WebRtcPeer and generating local sdp offer ...');

    const onIceCandidate = function (candidate) {
      const message = {
        id: 'onIceCandidate',
        candidate,
        cameraId: id,
      };
      that.sendMessage(message);
    };

    const options = {
      mediaConstraints: { audio: false, video: true },
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

      document.getElementById('webcamArea').appendChild(options.remoteVideo);
    }

    this.state.webRtcPeers[id] = new peerObj(options, function (error) {
      if (error) {
        console.error(' [ERROR] Webrtc error');
        console.error(error);
        return;
      }

      this.generateOffer((error, offerSdp) => {
        if (error) {
          return console.error(error);
        }

        console.info(`Invoking SDP offer callback function ${location.host}`);
        const message = {
          id: 'start',
          sdpOffer: offerSdp,
          cameraId: id,
          cameraShared: shareWebcam,
        };
        that.sendMessage(message);
      });
    });
  }

  stop(id) {
    const webRtcPeer = this.state.webRtcPeers[id];

    if (webRtcPeer) {
      console.log('Stopping WebRTC peer');

      webRtcPeer.dispose();
      delete this.state.webRtcPeers[id];
    } else {
      console.log('NO WEBRTC PEER TO STOP?');
    }

    const videoTag = document.getElementById(`video-elem-${id}`);
    if (videoTag) {
      document.getElementById('webcamArea').removeChild(videoTag);
    }

    this.sendMessage({ id: 'stop', cameraId: id });

    adjustVideos(true);
  }

  shareWebcam() {
    const { users } = this.props;
    const id = users[0].userId;

    this.start(id, true, this.refs.videoInput);
  }

  unshareWebcam() {
    const { users } = this.props;
    const id = users[0].userId;
    this.sendUserUnshareWebcam(id);
  }

  startResponse(message) {
    const id = message.cameraId;
    const webRtcPeer = this.state.webRtcPeers[id];

    if (message.sdpAnswer == null) {
      return console.debug('Null sdp answer. Camera unplugged?');
    }

    if (webRtcPeer == null) {
      return console.debug('Null webrtc peer ????');
    }

    console.log('SDP answer received from server. Processing ...');

    webRtcPeer.processAnswer(message.sdpAnswer, (error) => {
      if (error) {
        return console.error(error);
      }
    });

    this.sendUserShareWebcam(id);
  }

  sendMessage(message) {
    const ws = this.state.ws;

    if (ws.readyState == WebSocket.OPEN) {
      const jsonMessage = JSON.stringify(message);
      console.log(`Sending message: ${jsonMessage}`);
      ws.send(jsonMessage, (error) => {
        if (error) {
          console.error(`client: Websocket error "${error}" on message "${jsonMessage.id}"`);
        }
      });
    } else {
      this.state.wsQueue.push(message);
    }
  }

  handlePlayStop(message) {
    console.log('Handle play stop <--------------------');

    this.stop(message.cameraId);
  }

  handlePlayStart(message) {
    console.log('Handle play start <===================');

    adjustVideos(true);
  }

  handleError(message) {
    console.log(` Handle error ---------------------> ${message.message}`);
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
