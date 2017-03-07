import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Button from '/imports/ui/components/button/component';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';

const intlMessages = defineMessages({
  joinAudio: {
    id: 'app.audio.joinAudio',
    defaultMessage: 'Join Audio',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    defaultMessage: 'Leave Audio',
  }
});

class JoinAudioOptions extends React.Component {
  render() {
    const {
      close,
      intl,
      isInAudio,
      isInListenOnly,
      open,
    } = this.props;

    if (isInAudio || isInListenOnly) {
      return (
        <Button
          onClick={close}
          label={intl.formatMessage(intlMessages.leaveAudio)}
          color={'danger'}
          icon={'audio_off'}
          size={'lg'}
          circle={true}
        />
      );
    }

    return (
      <Button
        onClick={open}
        label={intl.formatMessage(intlMessages.joinAudio)}
        color={'primary'}
        icon={'audio_on'}
        size={'lg'}
        circle={true}
      />
    );
  }
}

export default withRouter(injectIntl(JoinAudioOptions));
