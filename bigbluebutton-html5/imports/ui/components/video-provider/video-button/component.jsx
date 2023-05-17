import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import VideoService from '../service';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';
import { debounce } from 'radash';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { isVirtualBackgroundsEnabled } from '/imports/ui/services/features';
import Button from '/imports/ui/components/common/button/component';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';

const ENABLE_WEBCAM_SELECTOR_BUTTON = Meteor.settings.public.app.enableWebcamSelectorButton;
const ENABLE_CAMERA_BRIGHTNESS = Meteor.settings.public.app.enableCameraBrightness;

const intlMessages = defineMessages({
  videoSettings: {
    id: 'app.video.videoSettings',
    description: 'Open video settings',
  },
  visualEffects: {
    id: 'app.video.visualEffects',
    description: 'Visual effects label',
  },
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
});

const JOIN_VIDEO_DELAY_MILLISECONDS = 500;

const propTypes = {
  intl: PropTypes.object.isRequired,
  hasVideoStream: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
};

const JoinVideoButton = ({
  intl,
  hasVideoStream,
  status,
  disableReason,
}) => {
  const { isMobile } = deviceInfo;
  const isMobileSharingCamera = hasVideoStream && isMobile;
  const isDesktopSharingCamera = hasVideoStream && !isMobile;
  const shouldEnableWebcamSelectorButton = ENABLE_WEBCAM_SELECTOR_BUTTON
    && isDesktopSharingCamera;
  const shouldEnableWebcamVisualEffectsButton =
    (isVirtualBackgroundsEnabled() || ENABLE_CAMERA_BRIGHTNESS)
    && hasVideoStream
    && !isMobile;
  const exitVideo = () => isDesktopSharingCamera && (!VideoService.isMultipleCamerasEnabled()
    || shouldEnableWebcamSelectorButton);

  const [propsToPassModal, setPropsToPassModal] = useState({});
  const [forceOpen, setForceOpen] = useState(false);
  const [isVideoPreviewModalOpen, setVideoPreviewModalIsOpen] = useState(false);

  const handleOnClick = debounce({ delay: JOIN_VIDEO_DELAY_MILLISECONDS }, () => {
    switch (status) {
      case 'videoConnecting':
        VideoService.stopVideo();
        break;
      case 'connected':
      default:
        if (exitVideo()) {
          VideoService.exitVideo();
        } else {
          setForceOpen(isMobileSharingCamera);
          setVideoPreviewModalIsOpen(true);
        }
    }
  });

  const handleOpenAdvancedOptions = (callback) => {
    if (callback) callback();
    setForceOpen(isDesktopSharingCamera);
    setVideoPreviewModalIsOpen(true);
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

  const renderUserActions = () => {
    const actions = [];

    if (shouldEnableWebcamSelectorButton) {
      actions.push(
        {
          key: 'advancedVideo',
          label: intl.formatMessage(intlMessages.advancedVideo),
          onClick: () => handleOpenAdvancedOptions(),
          dataTest: 'advancedVideoSettingsButton',
        },
      );
    }

    if (shouldEnableWebcamVisualEffectsButton) {
      actions.push(
        {
          key: 'virtualBgSelection',
          label: intl.formatMessage(intlMessages.visualEffects),
          onClick: () => handleOpenAdvancedOptions(() => setPropsToPassModal({ isVisualEffects: true })),
        },
      );
    }

    if (actions.length === 0) return null;
    const customStyles = { top: '-3.6rem' };

    return (
      <BBBMenu
        customStyles={!isMobile ? customStyles : null}
        trigger={(
          <ButtonEmoji
            emoji="device_list_selector"
            data-test="videoDropdownMenu"
            hideLabel
            label={intl.formatMessage(intlMessages.videoSettings)}
            rotate
            tabIndex={0}
          />
        )}
        actions={actions}
        opts={{
          id: "video-dropdown-menu",
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getcontentanchorel: null,
          fullwidth: "true",
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          transformOrigin: { vertical: 'top', horizontal: 'center'},
      }}
      />
    );
  }

  return (
    <>
      <Styled.OffsetBottom>
        <Button
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
        {renderUserActions()}
      </Styled.OffsetBottom>
      {isVideoPreviewModalOpen ? <VideoPreviewContainer 
        {...{
          callbackToClose: () => {
            setPropsToPassModal({});
            setForceOpen(false);
          }, 
          forceOpen,
          priority: "low",
          setIsOpen: setVideoPreviewModalIsOpen,
          isOpen: isVideoPreviewModalOpen
        }}
        {...propsToPassModal}
      /> : null}
    </>
  );
};

JoinVideoButton.propTypes = propTypes;

export default injectIntl(memo(JoinVideoButton));
