import React, { Component } from "react"
import ReactDOM from "react-dom"

import { styles } from './styles';

class VolumeSlider extends Component {

  constructor(props) {
    super(props);

    this.state = {
      volume: props.volume,
      muted: props.muted,
    }

    this.handleOnChange = this.handleOnChange.bind(this);
    this.getVolumeIcon = this.getVolumeIcon.bind(this);
    this.setMuted = this.setMuted.bind(this);
  }

  componentDidUpdate(prevProp, prevState) {
    if (prevProp.volume !== this.props.volume) {
      this.handleOnChange(this.props.volume);
    }

    if (prevProp.muted !== this.props.muted) {
      this.setMuted(this.props.muted);
    }
  }

  handleOnChange(volume) {
    this.props.onVolumeChanged(volume);

    this.setState({ volume }, () => {
      const { volume, muted } = this.state;
      if (muted && volume > 0) { // unmute if volume was raised during mute
        this.setMuted(false);
      } else if (volume <= 0) { // mute if volume is turned to 0
        this.setMuted(true);
      }
    });
  }

  setMuted(muted) {
    this.setState({ muted }, () => {
      this.props.onMuted(muted);
    });
  }

  getVolumeIcon() {
    const { muted, volume } = this.state;

    if (muted || volume <= 0) {
      return 'volume_off';
    } else if (volume <= 0.25) {
      return 'volume_mute';
    } else if (volume <= 0.75) {
      return 'volume_down';
    } else {
      return 'volume_up';
    }
  }

  render() {
    const { muted, volume } = this.state;
    const { handleOnChange, setMuted, getVolumeIcon } = this;

    return (
      <div className={styles.slider}>
        <span
          className={styles.volume}
          onClick={ () => { setMuted(!muted) } }
        >
          <i
            tabIndex="-1"
            className={`icon-bbb-${getVolumeIcon()}`}>
          </i>
        </span>
        <input
          className={styles.volumeSlider}
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={muted ? 0 : volume}
          onChange={(e) => { handleOnChange(e.target.valueAsNumber) }}
        />
      </div>);
  }
}

export default VolumeSlider;
