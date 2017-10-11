import React, { Component } from 'react';
import YUVCanvas from 'yuv-canvas';
import YUVBuffer from 'yuv-buffer';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const propTypes = {
  updateData: PropTypes.func.isRequired,
};

export default class VideoDock extends Component {

  static askNextYuvFrame(evt) {
    evt.source.postMessage('yuvFrame', '*');
  }

  constructor(props) {
    super(props);

    this.state = { height: 1, width: 1 };
    this.frameCount = 0;
    this.yuvFrame = {};
  }

  componentDidMount() {
    this.yuvCanvas = YUVCanvas.attach(this.canvas);
    window.addEventListener('message', this.onMessage.bind(this));
  }

  onMessage(evt) {
    if (evt.origin === 'http://127.0.0.1:8080' || evt.origin === 'http://localhost:8080') {
      // if no data is available, we wait 60ms.
      if (typeof evt.data === 'string') {
        if (evt.data.includes('false')) {
          setTimeout(() => (VideoDock.askNextYuvFrame(evt)), 60);
          this.frameCount = 0;
          return;
        } else if (evt.data.includes('ready')) {
          evt.source.postMessage('ready', '*');
          return;
        }
      }

      const fileReader = new FileReader();
      let options;
      let format;
      let frame;

      switch (this.frameCount) {
        case 0:
          fileReader.onload = (event) => {
            this.yuvFrame.y = new Uint8Array(event.target.result);
          };
          fileReader.readAsArrayBuffer(evt.data);
          this.frameCount = +1;
          break;

        case 1:
          fileReader.onload = (event) => {
            this.yuvFrame.u = new Uint8Array(event.target.result);
          };
          fileReader.readAsArrayBuffer(evt.data);
          this.frameCount = +1;
          break;
        case 2:
          fileReader.onload = (event) => {
            this.yuvFrame.v = new Uint8Array(event.target.result);
          };
          fileReader.readAsArrayBuffer(evt.data);
          this.frameCount = +1;
          break;
        case 3:
          options = JSON.parse(evt.data);

          format = YUVBuffer.format({
            width: options.width,
            height: options.height,
            chromaHeight: options.height / 2,
            chromaWidth: options.width / 2,
            displayWidth: this.videoDock.clientWidth,
            displayHeight: this.videoDock.clientHeight,
          });

          frame = {
            format,
            y: { bytes: this.yuvFrame.y, stride: options.strideY },
            u: { bytes: this.yuvFrame.u, stride: options.strideU },
            v: { bytes: this.yuvFrame.v, stride: options.strideV },
          };

          if (frame) {
            this.yuvCanvas.drawFrame(frame);
          }

          this.frameCount = 0;
          setTimeout(() => (VideoDock.askNextYuvFrame(evt)), 30);
          break;
        default:
          this.frameCount = 0;
      }
    }
  }

  render() {
    return (
      <div
        role="region"
        onClick={this.props.updateData}
        className={styles.videoDock}
        ref={(videoDock) => { this.videoDock = videoDock; }}
      >
        <canvas className={styles.canvas} ref={(canvas) => { this.canvas = canvas; }} />
      </div>
    );
  }
}

VideoDock.propTypes = propTypes;
