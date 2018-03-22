import React, { Component } from 'react';
import cx from 'classnames';
import { styles } from '../styles';

class VideoElement extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const tagId = this.props.localCamera ? 'shareWebcam' : `video-elem-${this.props.videoId}`;

    return (
      <div className={cx({
        [styles.videoContainer]: true,
        [styles.sharedWebcamVideo]: !this.props.shared && this.props.localCamera,
        [styles.sharedWebcamVideoLocal]: this.props.shared || !this.props.localCamera })}>

        <video id={tagId} muted={this.props.localCamera} autoPlay playsInline />
        <div className={styles.videoText}>
          <div className={styles.userName}>{this.props.name}</div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { videoId, localCamera } = this.props;

    const tagId = localCamera ? 'shareWebcam' : `video-elem-${videoId}`;
    const tag = document.getElementById(tagId);

    if (localCamera && this.props.onShareWebcam === 'function') {
      this.props.onShareWebcam();
    }

    if (typeof this.props.onMount === 'function') {
      this.props.onMount(videoId, localCamera, this.getVideoConstraints(), tag);
    }
  }

  componentWillUnmount() {
    if (typeof this.props.onUnmount === 'function') {
      this.props.onUnmount(this.props.videoId);
    }
  }

  getVideoConstraints() {
    let videoConstraints = {
      width: {
        min: 320,
        max: 640,
      },
      height: {
        min: 240,
        max: 480,
      },
    };

    if (!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) {
      videoConstraints.frameRate = { min: 5, ideal: 10, };
    }

    return videoConstraints;
  }
}

export default VideoElement;
