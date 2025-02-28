import React, { Component } from 'react';
import Styled from './styles';

class VolumeSlider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      volume: props.volume,
      muted: props.muted,
    };

    this.handleOnChange = this.handleOnChange.bind(this);
    this.getVolumeIcon = this.getVolumeIcon.bind(this);
    this.setMuted = this.setMuted.bind(this);
  }

  componentDidUpdate(prevProp) {
    const { volume, muted } = this.props;
    const { volume: prevVolume, muted: prevMuted } = prevProp;

    if (prevVolume !== volume) {
      this.handleOnChange(volume);
    }

    if (prevMuted !== muted) {
      this.setMuted(muted);
    }
  }

  handleOnChange(volume) {
    const { onVolumeChanged } = this.props;
    onVolumeChanged(volume);

    this.setState({ volume }, () => {
      const { volume: stateVolume, muted } = this.state;
      if (muted && stateVolume > 0) { // unmute if volume was raised during mute
        this.setMuted(false);
      } else if (stateVolume <= 0) { // mute if volume is turned to 0
        this.setMuted(true);
      }
    });
  }

  setMuted(muted) {
    const { onMuted } = this.props;
    this.setState({ muted }, () => onMuted(muted));
  }

  getVolumeIcon() {
    const { muted, volume } = this.state;

    if (muted || volume <= 0) return 'volume_off';

    if (volume <= 0.25) return 'volume_mute';

    if (volume <= 0.75) return 'volume_down';

    return 'volume_up';
  }

  render() {
    const { muted, volume } = this.state;
    const { hideVolume } = this.props;

    if (hideVolume) {
      return null;
    }

    return (
      <Styled.Slider>
        <Styled.Volume onClick={() => this.setMuted(!muted)}>
          <i
            tabIndex="-1"
            className={`icon-bbb-${this.getVolumeIcon()}`}
          />
        </Styled.Volume>
        <Styled.VolumeSlider
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={muted ? 0 : volume}
          onChange={(e) => this.handleOnChange(e.target.valueAsNumber)}
        />
      </Styled.Slider>
    );
  }
}

export default VolumeSlider;
