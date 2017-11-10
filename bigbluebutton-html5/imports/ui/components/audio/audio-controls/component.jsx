import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import styles from './styles';

const propTypes = {
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
  handleJoinAudio: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  disable: PropTypes.bool.isRequired,
  unmute: PropTypes.bool.isRequired,
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
      handleToggleMuteMicrophone,
      handleJoinAudio,
      handleLeaveAudio,
      mute,
      unmute,
      disable,
      join,
    } = this.props;

    return (
      <span className={styles.container} >
        {mute ?
          <Button
            className={styles.button}
            ref={(ref) => { this.muteBtn = ref; }}
            onClick={handleToggleMuteMicrophone}
            disabled={disable}
            label={unmute ? 'Unmute' : 'Mute'}
            color={'primary'}
            icon={unmute ? 'mute' : 'unmute'}
            size={'lg'}
            circle
          /> : null}
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

export default withShortcut(AudioControls, 'Control+Alt+m');
