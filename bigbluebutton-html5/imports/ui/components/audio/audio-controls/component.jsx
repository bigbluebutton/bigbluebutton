import React from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import styles from './styles';
import cx from 'classnames';

const propTypes = {
  disable: PropTypes.bool.isRequired,
  mute: PropTypes.bool.isRequired,
  join: PropTypes.bool.isRequired,
};

const AudioControls = ({
  handleToggleMuteMicrophone,
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
        label={join ? 'Leave Audio' : 'Join Audio'}
        color={join ? 'danger' : 'primary'}
        icon={join ? 'audio_off' : 'audio_on'}
        size={'lg'}
        circle
      /> : null
    }
  </span>
);

AudioControls.propTypes = propTypes;

export default AudioControls;
