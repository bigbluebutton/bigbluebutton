import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import VideoService from '../service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from '/imports/ui/components/video-provider/video-button/styles';

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
  handleJoinVideo: PropTypes.func.isRequired,
  handleCloseVideo: PropTypes.func.isRequired,
  validIOSVersion: PropTypes.func.isRequired,
};

const JoinVideoButton = ({
  intl,
  hasVideoStream,
  isDisabled,
  handleJoinVideo,
  handleCloseVideo,
  validIOSVersion,
}) => {
  const verifyIOS = () => {
    if (!validIOSVersion()) {
      return VideoService.notify(intl.formatMessage(intlMessages.iOSWarning));
    }
    handleJoinVideo();
  };

  const sharingVideoLabel = hasVideoStream
    ? intl.formatMessage(intlMessages.leaveVideo) : intl.formatMessage(intlMessages.joinVideo);

  const disabledLabel = isDisabled
    ? intl.formatMessage(intlMessages.videoLocked) : sharingVideoLabel;

  return (
    <Button
      label={disabledLabel}
      className={cx(styles.button, hasVideoStream || styles.btn)}
      onClick={hasVideoStream ? handleCloseVideo : verifyIOS}
      hideLabel
      aria-label={intl.formatMessage(intlMessages.videoButtonDesc)}
      color={hasVideoStream ? 'primary' : 'default'}
      icon={hasVideoStream ? 'video' : 'video_off'}
      ghost={!hasVideoStream}
      size="lg"
      circle
      disabled={isDisabled}
    />
  );
};

JoinVideoButton.propTypes = propTypes;
export default injectIntl(memo(JoinVideoButton));
