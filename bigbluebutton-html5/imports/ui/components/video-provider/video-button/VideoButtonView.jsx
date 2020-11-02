import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '/imports/ui/components/common';
import VideoService from '../service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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

const propTypes = {
  intl: intlShape.isRequired,
  hasVideoStream: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  mountVideoPreview: PropTypes.func.isRequired,
};

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
    // <Button
    //   data-test="joinVideo"
    //   label={isDisabled ? intl.formatMessage(intlMessages.videoLocked) : label}
    //   className={cx(styles.button, hasVideoStream || styles.btn)}
    //   onClick={handleOnClick}
    //   hideLabel
    //   aria-label={intl.formatMessage(intlMessages.videoButtonDesc)}
    //   color={hasVideoStream ? 'primary' : 'default'}
    //   icon={hasVideoStream ? 'video' : 'video_off'}
    //   ghost={!hasVideoStream}
    //   size="lg"
    //   circle
    //   disabled={isDisabled}
    // />
  );
};

VideoButtonView.propTypes = propTypes;

export default injectIntl(memo(VideoButtonView));
