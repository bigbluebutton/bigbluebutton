import React, { Component } from 'react';
import { styles } from './styles';

class VideoElement extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let cssClass;

    if (this.props.shared || !this.props.localCamera) {
      cssClass = styles.sharedWebcamVideoLocal;
    } else {
      cssClass = styles.sharedWebcamVideo;
    }
    return (
      <div className={`${styles.videoContainer} ${cssClass}`} >
        { this.props.localCamera ?
          <video id="shareWebcam" muted autoPlay playsInline />
          :
          <video id={`video-elem-${this.props.videoId}`} autoPlay playsInline />
        }
        <div className={styles.videoText}>
          <div className={styles.userName}>{this.props.name}</div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { videoId, localCamera } = this.props;
    const options = {
      mediaConstraints: {
        audio: false,
        video: this.getVideoConstraints(),
      },
      onicecandidate: this.props.candidateCallback,
    };

    if (localCamera) {
      options.localVideo = document.getElementById('shareWebcam');
    } else {
      options.remoteVideo = document.getElementById(`video-elem-${videoId}`);
    }

    if (typeof this.props.onMount === 'function') {
      this.props.onMount(videoId, localCamera, options);
    }
  }

  getVideoConstraints() {
    let videoConstraints = {};
    if (navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) {
      // Custom constraints for Safari
      videoConstraints = {
        width: {
          min: 320,
          max: 640,
        },
        height: {
          min: 240,
          max: 480,
        },
      };
    } else {
      videoConstraints = {
        width: {
          min: 320,
          ideal: 640,
        },
        height: {
          min: 240,
          ideal: 480,
        },
        frameRate: {
          min: 5,
          ideal: 10,
        },
      };
    }

    return videoConstraints;
  }
}

export default VideoElement;
