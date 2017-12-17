import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import Shortcut from '/imports/ui/components/shortcut/component';
import styles from './styles';

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
  glow: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const SHORTCUTS_CONFIG = Meteor.settings.public.shortcuts;
const SHORTCUT_COMBO = SHORTCUTS_CONFIG.mute_unmute.keys;

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
      <Shortcut keyCombo={SHORTCUT_COMBO}>
        <Button
          className={glow ? cx(styles.button, styles.glow) : styles.button}
          onClick={handleToggleMuteMicrophone}
          disabled={disable}
          hideLabel
          label={unmute
            ? intl.formatMessage(intlMessages.unmuteAudio)
            : intl.formatMessage(intlMessages.muteAudio)
          }
          aria-label={unmute
            ? intl.formatMessage(intlMessages.unmuteAudio)
            : intl.formatMessage(intlMessages.muteAudio)
          }
          color="primary"
          icon={unmute ? 'mute' : 'unmute'}
          size="lg"
          circle
        />
      </Shortcut> : null}
    <Button
      className={styles.button}
      onClick={join ? handleLeaveAudio : handleJoinAudio}
      disabled={disable}
      hideLabel
      aria-label={join
        ? intl.formatMessage(intlMessages.leaveAudio)
        : intl.formatMessage(intlMessages.joinAudio)
      }
      label={join
        ? intl.formatMessage(intlMessages.leaveAudio)
        : intl.formatMessage(intlMessages.joinAudio)
      }
      color={join ? 'danger' : 'primary'}
      icon={join ? 'audio_off' : 'audio_on'}
      size="lg"
      circle
    />
  </span>);

AudioControls.propTypes = propTypes;

export default injectIntl(AudioControls);
