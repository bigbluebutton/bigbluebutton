import React from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import styles from './styles';

const propTypes = {
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
  handleJoinAudio: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  unmute: PropTypes.bool.isRequired,
  mute: PropTypes.bool.isRequired,
  join: PropTypes.bool.isRequired,
};

const AudioControls = ({
  handleToggleMuteMicrophone,
  handleJoinAudio,
  handleLeaveAudio,
  mute,
  unmute,
  join,
}) => (
  <span className={styles.container}>
    {mute ?
      <Button
        onClick={handleToggleMuteMicrophone}
        label={unmute ? 'Unmute' : 'Mute'}
        color={'primary'}
        icon={unmute ? 'mute' : 'unmute'}
        size={'lg'}
        circle
      /> : null}
    <Button
      onClick={join ? handleLeaveAudio : handleJoinAudio}
      label={join ? 'Leave Audio' : 'Join Audio'}
      color={join ? 'danger' : 'primary'}
      icon={join ? 'audio_off' : 'audio_on'}
      size={'lg'}
      circle
    />
  </span>);

AudioControls.propTypes = propTypes;

export default AudioControls;
