import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Button from '/imports/ui/components/button/component';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import AudioManager from '/imports/api/2.0/audio/client/manager';

const intlMessages = defineMessages({
  joinAudio: {
    id: 'app.audio.joinAudio',
    description: 'Join audio button label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio button label',
  },
});

class JoinAudioOptions extends React.Component {
  render() {
    const {
      intl,
      isInAudio,
      isInListenOnly,
      isConnecting,
      handleJoinAudio,
      handleCloseAudio,
    } = this.props;

    let onClick = handleJoinAudio;
    let label = intl.formatMessage(intlMessages.joinAudio);
    let color = 'primary';
    let icon = 'audio_on';

    if (isInAudio || isInListenOnly) {
      onClick = handleCloseAudio;
      label = intl.formatMessage(intlMessages.leaveAudio);
      color = 'danger';
      icon = 'audio_off';
    }

    return (
      <Button
        onClick={onClick}
        label={label}
        color={color}
        icon={icon}
        size={'lg'}
        circle
      />
    );
  }
}

export default withRouter(injectIntl(JoinAudioOptions));
