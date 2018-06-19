import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { log } from '/imports/ui/services/api';

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
          slow: 0,
        });
        this.createAudioContext();
      });
    }
  }

  componentWillUnmount() {
    this.closeAudioContext();
  }

  createAudioContext() {
    this.audioContext = new AudioContext();
    this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.scriptProcessor.onaudioprocess = this.handleAudioProcess;
    this.source = null;

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
      slow: (0.75 * prevState.slow) + (0.25 * instant),
    }));
  }

  handleError(error) {
    log('error', JSON.stringify(error));
  }

  render() {
    const {
      low, optimum, high, ...props
    } = this.props;

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
