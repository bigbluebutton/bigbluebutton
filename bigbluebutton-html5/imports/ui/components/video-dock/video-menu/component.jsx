import React from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

const intlMessages = defineMessages({
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
});

const JoinVideoOptions = ({intl, isWaitingResponse, isConnected, isSharingVideo, handleJoinVideo, handleCloseVideo}) => {
  if (isSharingVideo) {
    return (
      <Button
        onClick={handleCloseVideo}
        label={intl.formatMessage(intlMessages.leaveVideo)}
        hideLabel
        aria-label={intl.formatMessage(intlMessages.leaveVideo)}
        color={'danger'}
        icon={'video'}
        size={'lg'}
        circle
        disabled={isWaitingResponse}
      />
    );
  }

  return (
    <Button
      onClick={handleJoinVideo}
      label={intl.formatMessage(intlMessages.joinVideo)}
      hideLabel
      aria-label={intl.formatMessage(intlMessages.joinVideo)}
      color={'primary'}
      icon={'video_off'}
      size={'lg'}
      circle
      disabled={isWaitingResponse || (!isSharingVideo && isConnected)}
    />
  );
}

export default injectIntl(JoinVideoOptions);
