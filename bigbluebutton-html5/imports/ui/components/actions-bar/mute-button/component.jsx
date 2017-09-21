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

const MuteAudio = ({
  isInAudio,
  isMuted,
  callback,
  isTalking,
  intl,
  listenOnly,
}) => {
  if (!isInAudio) return null;
  const muteLabel = intl.formatMessage(intlMessages.muteLabel);
  const unmuteLabel = intl.formatMessage(intlMessages.unmuteLabel);

  const label = !isMuted ? muteLabel : unmuteLabel;
  const icon = !isMuted ? 'unmute' : 'mute';
  const tabIndex = !isInAudio ? -1 : 0;
  let className = null;

  if (isInAudio && isTalking) {
    className = styles.circleGlow;
  }

  if (!listenOnly) {
    return (
      <Button
        onClick={callback}
        label={label}
        color={'primary'}
        icon={icon}
        size={'lg'}
        circle
        className={className}
        tabIndex={tabIndex}
      />
    );
  }

  return null;
};

export default injectIntl(MuteAudio);
