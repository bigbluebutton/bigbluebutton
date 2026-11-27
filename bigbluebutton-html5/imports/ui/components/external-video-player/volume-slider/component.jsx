import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  muteLabel: {
    id: 'app.externalVideo.muteLabel',
    description: 'Accessible label for the screen share audio mute button',
  },
  volumeLabel: {
    id: 'app.externalVideo.volumeLabel',
    description: 'Accessible label for the screen share audio volume slider',
  },
});

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
    const { hideVolume, intl } = this.props;

    if (hideVolume) {
      return null;
    }

    return (
      <Styled.Slider>
        <Styled.Volume
          type="button"
          aria-label={intl.formatMessage(intlMessages.muteLabel)}
          aria-pressed={muted}
          onClick={() => this.setMuted(!muted)}
        >
          <i
            aria-hidden="true"
            className={`icon-bbb-${this.getVolumeIcon()}`}
          />
        </Styled.Volume>
        <Styled.VolumeSlider
          type="range"
          aria-label={intl.formatMessage(intlMessages.volumeLabel)}
          aria-valuetext={intl.formatNumber(muted ? 0 : volume, { style: 'percent' })}
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

VolumeSlider.propTypes = {
  hideVolume: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
    formatNumber: PropTypes.func.isRequired,
  }).isRequired,
  muted: PropTypes.bool.isRequired,
  onMuted: PropTypes.func.isRequired,
  onVolumeChanged: PropTypes.func.isRequired,
  volume: PropTypes.number.isRequired,
};

VolumeSlider.defaultProps = {
  hideVolume: false,
};

export default injectIntl(VolumeSlider);
