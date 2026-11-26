import React, {
  memo, useCallback, useEffect, useRef, useState,
} from 'react';
import cx from 'classnames';
import { IntlShape, defineMessages, injectIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Button from '/imports/ui/components/common/button/component';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import PreviewService from '/imports/ui/components/video-preview/service';
import { CameraSettingsDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/camera-settings-dropdown-item/enums';
import { CameraSettingsDropdownInterface } from 'bigbluebutton-html-plugin-sdk';
import { listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import VideoService from '../service';
import Styled from './styles';
import { useModalRegistration } from '/imports/ui/core/singletons/modalController';

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
  disconnected: {
    id: 'app.video.clientDisconnected',
    description: 'Client disconnected label',
  },
});

const DISCONNECT_SAFETY_TIMEOUT_MS = 5000;

interface JoinVideoButtonProps {
  cameraSettingsDropdownItems: CameraSettingsDropdownInterface[];
  hasVideoStream: boolean;
  disableReason: string | undefined;
  status: string;
  exitVideo: () => Promise<boolean> | boolean;
  intl: IntlShape;
  videoConnecting: boolean;
}

const JoinVideoButton: React.FC<JoinVideoButtonProps> = ({
  intl,
  hasVideoStream,
  status,
  disableReason,
  cameraSettingsDropdownItems,
  exitVideo: exit,
  videoConnecting,
}) => {
  const { isMobile } = deviceInfo;
  const isMobileSharingCamera = hasVideoStream && isMobile;
  const isDesktopSharingCamera = hasVideoStream && !isMobile;

  const ENABLE_WEBCAM_SELECTOR_BUTTON = window.meetingClientSettings.public.app.enableWebcamSelectorButton;

  const shouldEnableWebcamSelectorButton = ENABLE_WEBCAM_SELECTOR_BUTTON
    && isDesktopSharingCamera;
  const shouldExitVideo = isDesktopSharingCamera && (!VideoService.isMultipleCamerasEnabled()
    || shouldEnableWebcamSelectorButton);

  const [propsToPassModal, setPropsToPassModal] = useState<{ isVisualEffects?: boolean }>({});
  const [forceOpen, setForceOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDisconnectTimer = useCallback(() => {
    if (disconnectTimerRef.current !== null) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!hasVideoStream) {
      clearDisconnectTimer();
      setIsDisconnecting(false);
    }
  }, [hasVideoStream, clearDisconnectTimer]);

  useEffect(() => clearDisconnectTimer, [clearDisconnectTimer]);

  const {
    isOpen: isVideoPreviewModalOpen,
    open: openVideoPreviewModal,
    close: closeVideoPreviewModal,
  } = useModalRegistration({
    id: 'videoPreviewModal',
    priority: 'low',
  });

  const setIsVideoPreviewModalOpen = useCallback((isOpen: boolean) => {
    if (isOpen) openVideoPreviewModal();
    else closeVideoPreviewModal();
  }, [openVideoPreviewModal, closeVideoPreviewModal]);

  const handleOnClick = useCallback(() => {
    if (disableReason || videoConnecting || isDisconnecting) return;

    if (shouldExitVideo) {
      setIsDisconnecting(true);
      clearDisconnectTimer();
      disconnectTimerRef.current = setTimeout(() => {
        disconnectTimerRef.current = null;
        setIsDisconnecting(false);
      }, DISCONNECT_SAFETY_TIMEOUT_MS);
      PreviewService.clearStreams();
      Promise.resolve(exit())
        .then((exited) => {
          if (exited === false) {
            clearDisconnectTimer();
            setIsDisconnecting(false);
          }
        })
        .catch(() => {
          clearDisconnectTimer();
          setIsDisconnecting(false);
        });
    } else if (!isVideoPreviewModalOpen) {
      setForceOpen(isMobileSharingCamera);
      setIsVideoPreviewModalOpen(true);
    }
  }, [
    disableReason,
    videoConnecting,
    isDisconnecting,
    shouldExitVideo,
    clearDisconnectTimer,
    exit,
    isVideoPreviewModalOpen,
    isMobileSharingCamera,
    setIsVideoPreviewModalOpen,
  ]);

  const handleOpenAdvancedOptions = (callback?: () => void) => {
    if (callback) callback();
    setForceOpen(isDesktopSharingCamera);
    setIsVideoPreviewModalOpen(true);
  };

  const getMessageFromStatus = () => {
    let statusMessage = status;
    if (status !== 'videoConnecting') {
      statusMessage = shouldExitVideo ? 'leaveVideo' : 'joinVideo';
    }
    return statusMessage;
  };

  const label = disableReason
    ? intl.formatMessage(intlMessages[disableReason as keyof typeof intlMessages])
    : intl.formatMessage(intlMessages[getMessageFromStatus() as keyof typeof intlMessages]);

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

    if (actions.length === 0) return null;
    const customStyles = { top: '-3.6rem' };

    cameraSettingsDropdownItems.forEach((plugin) => {
      switch (plugin.type) {
        case CameraSettingsDropdownItemType.OPTION:
          actions.push({
            key: plugin.id,
            // @ts-expect-error -> Plugin-related.
            label: plugin.label,
            dataTest: plugin.dataTest,
            // @ts-expect-error -> Plugin-related.
            onClick: plugin.onClick,
            // @ts-expect-error -> Plugin-related.
            icon: plugin.icon,
          });
          break;
        case CameraSettingsDropdownItemType.SEPARATOR:
          actions.push({
            key: plugin.id,
            isSeparator: true,
          });
          break;
        default:
          break;
      }
    });
    return (
      <BBBMenu
        customStyles={!isMobile ? customStyles : null}
        trigger={(
          <Styled.VideoDropdown
            emoji="device_list_selector"
            data-test="videoDropdownMenu"
            hideLabel
            label={intl.formatMessage(intlMessages.videoSettings)}
            tabIndex={0}
          />
        )}
        actions={actions}
        opts={{
          id: 'video-dropdown-menu',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getcontentanchorel: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          transformOrigin: { vertical: 'top', horizontal: 'center' },
        }}
      />
    );
  };

  return (
    <>
      <Styled.OffsetBottom>
        <Button
          className={cx('bbb-video-toggle', { 'bbb-video-toggle--off': !hasVideoStream })}
          label={label}
          data-test={hasVideoStream ? 'leaveVideo' : 'joinVideo'}
          onClick={handleOnClick}
          hideLabel
          color={hasVideoStream ? 'primary' : 'default'}
          icon={hasVideoStream ? 'video' : 'video_off'}
          size={deviceInfo.isMobile ? 'md' : 'lg'}
          circle
          disabled={!!disableReason || videoConnecting || isDisconnecting}
          loading={videoConnecting || isDisconnecting}
          hoverColor={listItemBgHover}
        />
        {renderUserActions()}
      </Styled.OffsetBottom>
      {isVideoPreviewModalOpen ? (
        <VideoPreviewContainer
          {...{
            callbackToClose: () => {
              setPropsToPassModal({});
              setForceOpen(false);
            },
            forceOpen,
            priority: 'low',
            setIsOpen: setIsVideoPreviewModalOpen,
            isOpen: isVideoPreviewModalOpen,
          }}
          isVisualEffects={propsToPassModal.isVisualEffects}
        />
      ) : null}
    </>
  );
};

export default injectIntl(memo(JoinVideoButton));
