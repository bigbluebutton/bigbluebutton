import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import Button from '/imports/ui/components/button/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import cx from 'classnames';
import styles from './styles';

const propTypes = {
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
  handleJoinAudio: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  disable: PropTypes.bool.isRequired,
  unmute: PropTypes.bool,
  mute: PropTypes.bool,
  join: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  glow: PropTypes.bool.isRequired,
};

const defaultProps = {
  unmute: null,
  mute: null,
};

const intlMessages = defineMessages({
  leaveAudioLabel: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio button label',
  },
  joinAudioLabel: {
    id: 'app.audio.joinAudio',
    description: 'Join audio button label',
  },
  muteAudioLabel: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteAudioLabel: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
});

const AudioControls = ({
  handleToggleMuteMicrophone,
  handleJoinAudio,
  handleLeaveAudio,
  mute,
  unmute,
  disable,
  glow,
  join,
  intl,
}) => (
  <span className={styles.container}>
    {mute ?
      <Button
        className={glow ? cx(styles.button, styles.glow) : styles.button}
        onClick={handleToggleMuteMicrophone}
        disabled={disable}
        label={unmute ? intl.formatMessage(intlMessages.unmuteAudioLabel) :
            intl.formatMessage(intlMessages.muteAudioLabel)}
        color="primary"
        icon={unmute ? 'mute' : 'unmute'}
        size="lg"
        circle
      /> : null}
    <Button
      className={styles.button}
      onClick={join ? handleLeaveAudio : handleJoinAudio}
      disabled={disable}
      label={join ? intl.formatMessage(intlMessages.leaveAudioLabel) :
          intl.formatMessage(intlMessages.joinAudioLabel)}
      color={join ? 'danger' : 'primary'}
      icon={join ? 'audio_off' : 'audio_on'}
      size="lg"
      circle
    />
  </span>);

AudioControls.propTypes = propTypes;
AudioControls.defaultProps = defaultProps;

export default withModalMounter(injectIntl(AudioControls));
