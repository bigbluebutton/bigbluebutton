import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { logClient } from '/imports/ui/services/api';
import IosHandler from '/imports/ui/services/ios-handler';

const propTypes = {
  low: PropTypes.number,
  optimum: PropTypes.number,
  high: PropTypes.number,
  deviceId: PropTypes.string,
};

const defaultProps = {
  low: 0,
  optimum: 0.05,
  high: 0.3,
  deviceId: undefined,
};

const AudioContext = window.AudioContext || window.webkitAudioContext;

class AudioStreamVolume extends Component {
  constructor(props) {
    super(props);

    this.createAudioContext = this.createAudioContext.bind(this);
    this.closeAudioContext = this.closeAudioContext.bind(this);
    this.handleConnectStreamToProcessor = this.handleConnectStreamToProcessor.bind(this);
    this.handleAudioProcess = this.handleAudioProcess.bind(this);
    this.handleError = this.handleError.bind(this);

    this.state = {
      instant: 0,
      slow: 0,
    };
  }

  componentDidMount() {
    this.createAudioContext();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.deviceId !== this.props.deviceId) {
      this.closeAudioContext().then(() => {
        this.setState({
          instant: 0,
          slow: 0,
        });
        this.createAudioContext();
      });
    }
  }

  componentWillUnmount() {
    IosHandler.requestMicrophoneLevelStop();

    this.closeAudioContext();
  }

  createAudioContext() {

    if (window.navigator.userAgent === 'BigBlueButton') {
      console.log('request mic level start')
      IosHandler.requestMicrophoneLevelStart();
      window.addEventListener('audioInputChange',
      (e) => {
        console.log('eventlistener for volume change', e.detail.message);
        this.setState((prevState) => ({
          instant: parseFloat(e.detail.message),
          slow: parseFloat(e.detail.message),
        }));
      });
      return;
    } else {
      this.audioContext = new AudioContext();
      this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
      this.scriptProcessor.onaudioprocess = this.handleAudioProcess;
      this.source = null;
    }

    const constraints = {
      audio: true,
    };

    const { deviceId } = this.props;

    if (deviceId) {
      constraints.audio = {
        deviceId,
      };
    }

    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then(this.handleConnectStreamToProcessor)
      .catch(this.handleError);
  }

  closeAudioContext() {
    return this.audioContext.close().then(() => {
      this.audioContext = null;
      this.scriptProcessor = null;
      this.source = null;
    });
  }

  handleConnectStreamToProcessor(stream) {
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  handleAudioProcess(event) {
    const input = event.inputBuffer.getChannelData(0);
    const sum = input.reduce((a, b) => a + (b * b), 0);
    const instant = Math.sqrt(sum / input.length);

    this.setState(prevState => ({
      instant,
      slow: 0.75 * prevState.slow + 0.25 * instant,
    }));
  }

  handleError(error) {
    logClient('error', { error, method: 'handleError' });
  }

  render() {
    const { low, optimum, high, deviceId, ...props } = this.props;
    const { instant, slow } = this.state;

    return (
      <meter
        {...props}
        min={0}
        max={high * 1.25}
        low={low}
        optimum={optimum}
        high={high}
        value={this.state.slow}
      />
    );
  }
}

AudioStreamVolume.propTypes = propTypes;
AudioStreamVolume.defaultProps = defaultProps;

export default AudioStreamVolume;
