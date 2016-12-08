import React, { Component, PropTypes } from 'react';

const propTypes = {
  low: PropTypes.number,
  optimum: PropTypes.number,
  high: PropTypes.number,
};

const defaultProps = {
  low: 0,
  optimum: .05,
  high: .15,
};

class AudioStreamVolume extends Component {
  constructor(props) {
    super(props);

    this.handleUserMediaSuccess = this.handleUserMediaSuccess.bind(this);
    this.handleUserMediaError = this.handleUserMediaError.bind(this);
    this.handleOnAudioProcess = this.handleOnAudioProcess.bind(this);

    this.audioContext = new AudioContext();
    this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.scriptProcessor.onaudioprocess = this.handleOnAudioProcess;
    this.source = null;

    this.constraints = {
      audio: true,
      video: false,
    };

    this.state = {
      instant: 0,
      slow: 0,
    };
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then(this.handleUserMediaSuccess)
      .catch(this.handleUserMediaError);
  }

  handleUserMediaSuccess(stream) {
    try {
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
    } catch (e) {
      console.error(e);
    }
  }

  handleUserMediaError(error) {
    console.error(error);
  }

  handleOnAudioProcess(event) {
    const input = event.inputBuffer.getChannelData(0);
    const sum = input.reduce((a, b) => a + (b * b), 0);
    const instant = Math.sqrt(sum / input.length);

    this.setState((prevState) => ({
      instant: instant,
      slow: 0.75 * prevState.slow + 0.25 * instant,
    }));
  }

  render() {
    const { low, optimum, high, ...props } = this.props;
    const { instant, slow } = this.state;

    return (
      <div>
      <meter
        {...props}
        style={{
          width: `100%`,
          height: `3rem`,
        }}
        min={0}
        max={high * 1.25}
        low={low}
        optimum={optimum}
        high={high}
        value={this.state.instant}
      />
      <br/>
      <meter
        {...props}
        style={{
          width: `100%`,
          height: `3rem`,
        }}
        min={0}
        max={high * 1.25}
        low={low}
        optimum={optimum}
        high={high}
        value={this.state.slow}
      />
      </div>
    );
  }
};

AudioStreamVolume.propTypes = propTypes;
AudioStreamVolume.defaultProps = defaultProps;

export default AudioStreamVolume;
