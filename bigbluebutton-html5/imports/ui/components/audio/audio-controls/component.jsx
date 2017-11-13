import React from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import MuteToggleBtnContainer from '../mute-toggle-btn/container';
import styles from './styles';

const propTypes = {
  handleJoinAudio: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  disable: PropTypes.bool.isRequired,
  mute: PropTypes.bool.isRequired,
  join: PropTypes.bool.isRequired,
};

const AudioControls = (props) => {
  const {
    handleJoinAudio,
    handleLeaveAudio,
    mute,
    disable,
    join,
  } = props;

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
};

AudioControls.propTypes = propTypes;

export default AudioControls;
