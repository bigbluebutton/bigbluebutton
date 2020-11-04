import React, { memo } from 'react';
import { IconButton } from '/imports/ui/components/common';
import VideoService from '../service';
import { defineMessages, injectIntl } from 'react-intl';
import { validIOSVersion } from '/imports/ui/components/app/service';

const intlMessages = defineMessages({
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
  videoButtonDesc: {
    id: 'app.video.videoButtonDesc',
    description: 'video button description',
  },
  videoLocked: {
    id: 'app.video.videoLocked',
    description: 'video disabled label',
  },
  iOSWarning: {
    id: 'app.iOSWarning.label',
    description: 'message indicating to upgrade ios version',
  },
});

const VideoButtonView = ({
  intl,
  hasVideoStream,
  isDisabled,
  mountVideoPreview,
}) => {
  const exitVideo = () => hasVideoStream && !VideoService.isMultipleCamerasEnabled();

  const handleOnClick = () => {
    if (!validIOSVersion()) {
      return VideoService.notify(intl.formatMessage(intlMessages.iOSWarning));
    }

    if (exitVideo()) {
      VideoService.exitVideo();
    } else {
      mountVideoPreview();
    }
  };

  return (

    <IconButton
      color={hasVideoStream ? 'error' : 'secondary'}
      icon={hasVideoStream ? 'camera' : 'camera-off'}
      disabled={isDisabled}
      onClick={handleOnClick}
    />
  );
};

export default injectIntl(memo(VideoButtonView));
