import React from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import styles from './styles';
import cx from 'classnames';

const propTypes = {
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
  handleJoinAudio: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  disable: PropTypes.bool.isRequired,
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
  disable,
  glow,
  join,
}) => (
  <span className={styles.container}>
    {mute ?
      <Button
        className={glow ? cx(styles.button, styles.glow) : styles.button}
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
  </span>);

AudioControls.propTypes = propTypes;

export default AudioControls;
