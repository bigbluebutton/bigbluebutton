import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import MuteToggleBtnContainer from '../mute-toggle-btn/container';
import styles from './styles';

const propTypes = {
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
  handleJoinAudio: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  disable: PropTypes.bool.isRequired,
  mute: PropTypes.bool.isRequired,
  join: PropTypes.bool.isRequired,
};

export class AudioControls extends Component {
  constructor() {
    super();
    this.handleShortcut = this.handleShortcut.bind(this);
  }

  handleShortcut() {
    const { handleToggleMuteMicrophone } = this.props;
    handleToggleMuteMicrophone();
  }

  render() {
    const {
      handleJoinAudio,
      handleLeaveAudio,
      mute,
      disable,
      join,
    } = this.props;

    return (
      <span className={styles.container} >
        {mute ? <MuteToggleBtnContainer /> : null}
        <Button
          className={styles.button}
          onClick={join ? handleLeaveAudio : handleJoinAudio}
          disabled={disable}
          label={join ? 'Leave Audio' : 'Join Audio'}
          color={join ? 'danger' : 'primary'}
          icon={join ? 'audio_off' : 'audio_on'}
          size={'lg'}
          circle
        />
      </span>
    );
  }
}

AudioControls.propTypes = propTypes;

export default AudioControls;
