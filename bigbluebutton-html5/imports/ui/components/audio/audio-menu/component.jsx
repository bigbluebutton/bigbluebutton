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
      handleJoinAudio,
      handleCloseAudio,
    } = this.props;

    if (isInAudio || isInListenOnly) {
      if (AudioManager.currentState == AudioManager.callStates.inConference ||
      AudioManager.currentState == AudioManager.callStates.inListenOnly) {
        return (
          <Button
            onClick={handleCloseAudio}
            label={intl.formatMessage(intlMessages.leaveAudio)}
            color={'danger'}
            icon={'audio_off'}
            size={'lg'}
            circle
          />
        );
      }
    }

    return (
      <Button
        onClick={handleJoinAudio}
        label={intl.formatMessage(intlMessages.joinAudio)}
        color={'primary'}
        icon={'audio_on'}
        size={'lg'}
        circle
      />
    );
  }
}

export default withRouter(injectIntl(JoinAudioOptions));
