import React, { Component } from 'react';
import ScreenshareContainer from '/imports/ui/components/screenshare/container';
import styles from './styles.scss';
import YUVCanvas from 'yuv-canvas';
import YUVBuffer from 'yuv-buffer';
import PropTypes from 'prop-types';

export default class VideoDock extends Component {

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

  render() {
    return (
      <div className={styles.videoDock} ref={(videoDock) => { this.videoDock = videoDock; }}>
        <canvas ref={(canvas) => { this.canvas = canvas; }} />
      </div>
    );
  }

  onMessage(evt) {
    console.log('Eventão', evt);

    if (evt.origin === 'http://127.0.0.1:8080') {
      // if not data is available, we wait 60ms.
      if (typeof evt.data === 'string') {
        if (evt.data.includes('false')) {
          setTimeout(() => (this.askNextYuvFrame(evt)), 10000);
          this.frameCount = 0;
          return;
        } else if (evt.data.includes('ready')) {
          evt.source.postMessage('ready', '*');
          return;
        }
      }

      switch (this.frameCount) {
        case 0:
          // this.yuvFrame.y = new Uint8Array(evt.data);
          var fileReader = new FileReader();
          fileReader.onload = (event) => {
            this.yuvFrame.y = new Uint8Array(event.target.result);
          };
          fileReader.readAsArrayBuffer(evt.data);
          this.frameCount++;
          break;

        case 1:
          // this.yuvFrame.u = new Uint8Array(evt.data);
          var fileReader = new FileReader();
          fileReader.onload = (event) => {
            this.yuvFrame.u = new Uint8Array(event.target.result);
          };
          fileReader.readAsArrayBuffer(evt.data);
          this.frameCount++;
          break;
        case 2:
          // this.yuvFrame.v = new Uint8Array(evt.data);
          var fileReader = new FileReader();
          fileReader.onload = (event) => {
            this.yuvFrame.v = new Uint8Array(event.target.result);
          };
          fileReader.readAsArrayBuffer(evt.data);
          this.frameCount++;
          break;
        case 3:
          const options = JSON.parse(evt.data);
          console.log('yuvFrame', this.yuvFrame);
          console.log('options', options);

          const format = YUVBuffer.format({
            width: options.width,
            height: options.height,
            chromaHeight: options.height / 2,
            chromaWidth: options.width / 2,
            displayWidth: this.videoDock.clientWidth,
            displayHeight: this.videoDock.clientHeight,
          });

          const frame = { format,
            y: { bytes: this.yuvFrame.y, stride: options.strideY },
            u: { bytes: this.yuvFrame.u, stride: options.strideU },
            v: { bytes: this.yuvFrame.v, stride: options.strideV },
          };

          if (frame) {
            this.yuvCanvas.drawFrame(frame);
          }

          this.frameCount = 0;
          setTimeout(() => (this.askNextYuvFrame(evt)), 10000);
          break;
      }
    }
  }

  askNextYuvFrame(evt) {
    console.log('Requisitando frame');
    evt.source.postMessage('yuvFrame', '*');
  }
}
