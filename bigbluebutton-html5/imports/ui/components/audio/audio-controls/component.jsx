import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import cx from 'classnames';

const intlMessages = defineMessages({
  joinAudio: {
    id: 'app.audio.joinAudio',
    description: 'Join audio button label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio button label',
  },
  muteAudio: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteAudio: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
});

const propTypes = {
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
  handleJoinAudio: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  disable: PropTypes.bool.isRequired,
  unmute: PropTypes.bool.isRequired,
  mute: PropTypes.bool.isRequired,
  join: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  glow: PropTypes.bool,
};

const defaultProps = {
  glow: false,
};

const SHORTCUTS_CONFIG = Meteor.settings.public.app.shortcuts;
const JOIN_AUDIO_AK = SHORTCUTS_CONFIG.joinAudio.accesskey;
const LEAVE_AUDIO_AK = SHORTCUTS_CONFIG.leaveAudio.accesskey;
const MUTE_UNMUTE_AK = SHORTCUTS_CONFIG.toggleMute.accesskey;

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
        hideLabel
        label={unmute ? intl.formatMessage(intlMessages.unmuteAudio) : intl.formatMessage(intlMessages.muteAudio)}
        aria-label={unmute ? intl.formatMessage(intlMessages.unmuteAudio) : intl.formatMessage(intlMessages.muteAudio)}
        color="primary"
        icon={unmute ? 'mute' : 'unmute'}
        size="lg"
        circle
        accessKey={MUTE_UNMUTE_AK}
      /> : null}
    <Button
      className={styles.button}
      onClick={join ? handleLeaveAudio : handleJoinAudio}
      disabled={disable}
      hideLabel
      aria-label={join ? intl.formatMessage(intlMessages.leaveAudio) : intl.formatMessage(intlMessages.joinAudio)}
      label={join ? intl.formatMessage(intlMessages.leaveAudio) : intl.formatMessage(intlMessages.joinAudio)}
      color={join ? 'danger' : 'primary'}
      icon={join ? 'audio_off' : 'audio_on'}
      size="lg"
      circle
      accessKey={join ? LEAVE_AUDIO_AK : JOIN_AUDIO_AK}
    />
  </span>);

AudioControls.propTypes = propTypes;
AudioControls.defaultProps = defaultProps;

export default injectIntl(AudioControls);
