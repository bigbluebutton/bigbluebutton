import { defineMessages, injectIntl } from 'react-intl';
import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../styles.scss';

const intlMessages = defineMessages({
  muteLabel: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteLabel: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
});

const MuteAudio = ({ intl, toggleSelfVoice, voiceUserData }) => {
  const { isInAudio, isMuted, isTalking, listenOnly } = voiceUserData;

  if (!isInAudio || listenOnly) return null;
  const muteLabel = intl.formatMessage(intlMessages.muteLabel);
  const unmuteLabel = intl.formatMessage(intlMessages.unmuteLabel);

  const label = !isMuted ? muteLabel : unmuteLabel;
  const icon = !isMuted ? 'unmute' : 'mute';
  const tabIndex = !isInAudio ? -1 : 0;
  let className = null;

  if (isInAudio && isTalking) {
    className = styles.circleGlow;
  }

  return (
    <Button
      onClick={toggleSelfVoice}
      label={label}
      color={'primary'}
      icon={icon}
      size={'lg'}
      circle
      className={className}
      tabIndex={tabIndex}
    />
  );
};

export default injectIntl(MuteAudio);
