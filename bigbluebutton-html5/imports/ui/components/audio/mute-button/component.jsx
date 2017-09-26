import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';
//
import { defineMessages, injectIntl } from 'react-intl';

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

class MuteAudio extends React.Component {

  render() {
    const {
      isInAudio,
      isMuted,
      toggleMuteMicrophone,
      isTalking,
      intl,
      isListenOnly,
    } = this.props;

    const icon = !isMuted ? 'unmute' : 'mute';
    const label = intl.formatMessage(!isMuted ? intlMessages.muteLabel :
                                                intlMessages.unmuteLabel);
    // const tabIndex = !isInAudio ? -1 : 0;
    let className;

    if (isTalking) {
      className = styles.circleGlow;
    }

    return (
      <Button
        onClick={toggleMuteMicrophone}
        label={label}
        color={'primary'}
        icon={icon}
        size={'lg'}
        circle
        className={className}
      />

        //tabIndex={tabIndex}
    );
  }
}

export default injectIntl(MuteAudio);
