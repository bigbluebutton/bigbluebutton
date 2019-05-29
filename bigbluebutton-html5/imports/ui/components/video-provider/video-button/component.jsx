import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from './styles';

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
  isSharingVideo: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  handleJoinVideo: PropTypes.func.isRequired,
  handleCloseVideo: PropTypes.func.isRequired,
};

const JoinVideoButton = ({
  intl,
  isSharingVideo,
  isDisabled,
  handleJoinVideo,
  handleCloseVideo,
  notify,
  validIOSVersion,
}) => {
  const verifyIOS = () => {
    if (!validIOSVersion()) {
      return notify(
        intl.formatMessage(intlMessages.iOSWarning),
        'error',
        'warning',
      );
    }
    handleJoinVideo();
  };

  return (
    <Button
      label={isDisabled
        ? intl.formatMessage(intlMessages.videoLocked)
        : (isSharingVideo
          ? intl.formatMessage(intlMessages.leaveVideo)
          : intl.formatMessage(intlMessages.joinVideo)
        )
      }
      className={cx(styles.button, isSharingVideo || styles.btn)}
      onClick={isSharingVideo ? handleCloseVideo : verifyIOS}
      hideLabel
      aria-label={intl.formatMessage(intlMessages.videoButtonDesc)}
      color={isSharingVideo ? 'primary' : 'default'}
      icon={isSharingVideo ? 'video' : 'video_off'}
      ghost={!isSharingVideo}
      size="lg"
      circle
      disabled={isDisabled}
    />
  );
};

JoinVideoButton.propTypes = propTypes;
export default injectIntl(JoinVideoButton);
