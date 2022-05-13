import React, { memo } from 'react';
import PropTypes from 'prop-types';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import VideoService from '../service';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import { validIOSVersion } from '/imports/ui/components/app/service';
import deviceInfo from '/imports/utils/deviceInfo';
import { debounce } from 'lodash';

const ENABLE_WEBCAM_SELECTOR_BUTTON = Meteor.settings.public.app.enableWebcamSelectorButton;

const intlMessages = defineMessages({
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
  advancedVideo: {
    id: 'app.video.advancedVideo',
    description: 'Open advanced video label',
  },
  videoLocked: {
    id: 'app.video.videoLocked',
    description: 'video disabled label',
  },
  videoConnecting: {
    id: 'app.video.connecting',
    description: 'video connecting label',
  },
  camCapReached: {
    id: 'app.video.meetingCamCapReached',
    description: 'meeting camera cap label',
  },
  meteorDisconnected: {
    id: 'app.video.clientDisconnected',
    description: 'Meteor disconnected label',
  },
  iOSWarning: {
    id: 'app.iOSWarning.label',
    description: 'message indicating to upgrade ios version',
  },
});

const JOIN_VIDEO_DELAY_MILLISECONDS = 500;

const propTypes = {
  intl: PropTypes.object.isRequired,
  hasVideoStream: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  mountVideoPreview: PropTypes.func.isRequired,
};

const JoinVideoButton = ({
  intl,
  hasVideoStream,
  status,
  disableReason,
  mountVideoPreview,
}) => {
  const { isMobile } = deviceInfo;
  const isMobileSharingCamera = hasVideoStream && isMobile;
  const isDesktopSharingCamera = hasVideoStream && !isMobile;
  const shouldEnableWebcamSelectorButton = ENABLE_WEBCAM_SELECTOR_BUTTON
    && isDesktopSharingCamera;
  const exitVideo = () => isDesktopSharingCamera && (!VideoService.isMultipleCamerasEnabled()
    || shouldEnableWebcamSelectorButton);

  const handleOnClick = debounce(() => {
    if (!validIOSVersion()) {
      return VideoService.notify(intl.formatMessage(intlMessages.iOSWarning));
    }

    switch (status) {
      case 'videoConnecting':
        VideoService.stopVideo();
        break;
      case 'connected':
      default:
        if (exitVideo()) {
          VideoService.exitVideo();
        } else {
          mountVideoPreview(isMobileSharingCamera);
        }
    }
  }, JOIN_VIDEO_DELAY_MILLISECONDS);

  const handleOpenAdvancedOptions = (e) => {
    e.stopPropagation();
    mountVideoPreview(isMobileSharingCamera);
  };

  const getMessageFromStatus = () => {
    let statusMessage = status;
    if (status !== 'videoConnecting') {
      statusMessage = exitVideo() ? 'leaveVideo' : 'joinVideo';
    }
    return statusMessage;
  };

  const label = disableReason
    ? intl.formatMessage(intlMessages[disableReason])
    : intl.formatMessage(intlMessages[getMessageFromStatus()]);

  const isSharing = hasVideoStream || status === 'videoConnecting';

  const renderEmojiButton = () => (
    shouldEnableWebcamSelectorButton
      && (
      <ButtonEmoji
        onClick={handleOpenAdvancedOptions}
        emoji="device_list_selector"
        hideLabel
        label={intl.formatMessage(intlMessages.advancedVideo)}
      />
      )
  );

  return (
    <Styled.OffsetBottom>
      <Styled.VideoButton
        label={label}
        data-test={hasVideoStream ? 'leaveVideo' : 'joinVideo'}
        onClick={handleOnClick}
        hideLabel
        color={isSharing ? 'primary' : 'default'}
        icon={isSharing ? 'video' : 'video_off'}
        ghost={!isSharing}
        size="lg"
        circle
        disabled={!!disableReason}
      />
      {renderEmojiButton()}
    </Styled.OffsetBottom>
  );
};

JoinVideoButton.propTypes = propTypes;

export default injectIntl(memo(JoinVideoButton));
