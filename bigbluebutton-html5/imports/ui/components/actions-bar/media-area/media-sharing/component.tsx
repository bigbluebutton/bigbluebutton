import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import KEYS from '/imports/utils/keys';
import { useIsScreenGloballyBroadcasting, screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import { defineMessages, IntlShape } from 'react-intl';
import { MediaAreaItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/media-area-item/enums';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import { MediaButton } from '/imports/ui/components/actions-bar/media-area/media-sharing/media-button/component';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/media-area/media-sharing/screenshare/container';
import PresentationUploaderContainer from './presentation/container';
import ExternalVideoView from './external-video/component';
import CameraAsContentView from './camera-as-content/component';
import { MediaButtonPluginItem } from '../types';
import { layoutSelectOutput } from '/imports/ui/components/layout/context';
import { Output } from '/imports/ui/components/layout/layoutTypes';

interface MediaSharingModalProps {
  open: boolean;
  onClose: () => void;
  intl: IntlShape;
  amIPresenter: boolean | undefined;
  amIModerator: boolean | undefined;
  isMeteorConnected: boolean;
  mediaAreaItems?: MediaButtonPluginItem[];
  isCameraAsContentEnabled: boolean;
  hasCameraAsContent: boolean;
  handleTakePresenter: () => void;
  hasPresentation: boolean;
  isPresentationManagementDisabled: boolean | undefined;
  isPresentationEnabled: boolean;
  isSharingVideo: boolean;
  allowExternalVideo: boolean;
  stopExternalVideoShare: () => void;
  setPresentationFitToWidth: (fitToWidth: boolean) => void;
  isMobile: boolean;
  isRTL: boolean;
}

const intlMessages = defineMessages({
  mediaSharingTitle: {
    id: 'app.mediaSharing.modal.title',
    description: 'Media sharing modal title',
  },
  mediaSharingSlides: {
    id: 'app.mediaSharing.modal.slides',
    description: 'Media sharing slides button text',
  },
  mediaSharingVideoLink: {
    id: 'app.mediaSharing.modal.videoLink',
    description: 'Media sharing video link button text',
  },
  mustBePresenter: {
    id: 'app.mediaSharing.modal.mustBePresenter',
    description: 'Message indicating that the user must be a presenter to share content',
  },
  cameraAsContentSettingsTitle: {
    id: 'app.videoPreview.cameraAsContentSettingsTitle',
    description: 'Title for the video preview modal when sharing camera as content',
  },
  stopSharingLabel: {
    id: 'app.mediaSharing.modal.stopSharing',
    description: 'Label for the stop sharing button in the sharing media modal',
  },
  screenShareLabel: {
    id: 'app.screenshare.screenShareLabel',
    description: 'Label for screen share button',
  },
  mediaLabel: {
    id: 'app.actionsBar.actionsDropdown.actionsLabel',
    description: 'Actions button label',
  },
  presentationLabel: {
    id: 'app.actionsBar.actionsDropdown.presentationLabel',
    description: 'Upload a presentation option label',
  },
  presentationDesc: {
    id: 'app.actionsBar.actionsDropdown.presentationDesc',
    description: 'adds context to upload presentation option',
  },
  desktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.desktopShareDesc',
    description: 'adds context to desktop share option',
  },
  stopDesktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareDesc',
    description: 'adds context to stop desktop share option',
  },
  takePresenter: {
    id: 'app.actionsBar.actionsDropdown.takePresenter',
    description: 'Label for take presenter role option',
  },
  takePresenterDesc: {
    id: 'app.actionsBar.actionsDropdown.takePresenterDesc',
    description: 'Description of take presenter role option',
  },
  startExternalVideoLabel: {
    id: 'app.actionsBar.actionsDropdown.shareExternalVideo',
    description: 'Start sharing external video button',
  },
  stopExternalVideoLabel: {
    id: 'app.actionsBar.actionsDropdown.stopShareExternalVideo',
    description: 'Stop sharing external video button',
  },
  layoutModal: {
    id: 'app.actionsBar.actionsDropdown.layoutModal',
    description: 'Label for layouts selection button',
  },
  shareCameraAsContent: {
    id: 'app.actionsBar.actionsDropdown.shareCameraAsContent',
    description: 'Label for share camera as content',
  },
  unshareCameraAsContent: {
    id: 'app.actionsBar.actionsDropdown.unshareCameraAsContent',
    description: 'Label for unshare camera as content',
  },
  confirmLabel: {
    id: 'app.actionsBar.actionsDropdown.confirmLabel',
    description: 'Confirm button label',
  },
});

const MediaSharingModal: React.FC<MediaSharingModalProps> = ({
  open, onClose, intl, amIPresenter = false, isMeteorConnected,
  mediaAreaItems = [],
  isCameraAsContentEnabled,
  hasCameraAsContent,
  hasPresentation,
  amIModerator = false,
  handleTakePresenter,
  isPresentationManagementDisabled = false,
  isPresentationEnabled,
  isSharingVideo,
  allowExternalVideo,
  stopExternalVideoShare,
  setPresentationFitToWidth,
  isMobile,
  isRTL,
}) => {
  const actionsBarStyle = layoutSelectOutput((i: Output) => i.actionBar);
  const { screenIsShared: isScreenGloballyBroadcasting } = useIsScreenGloballyBroadcasting();
  const [currentView, setCurrentView] = useState<'main' | 'presentation' | 'externalVideo' | 'cameraAsContent'>('main');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYS.ESCAPE) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const handleBackClick = () => {
    setCurrentView('main');
  };

  const handleClose = () => {
    setCurrentView('main');
    onClose();
  };

  const handlePresentationClick = () => {
    setCurrentView('presentation');
  };

  const handleExternalVideoClick = () => {
    setCurrentView('externalVideo');
  };

  const handleCameraAsContentClick = () => {
    screenshareHasEnded();
    setCurrentView('cameraAsContent');
  };

  const renderContent = () => {
    if (currentView === 'main') {
      return (
        <Styled.MediaGrid isMobile={isMobile}>
          <ScreenshareButtonContainer {...{
            amIPresenter,
            isMeteorConnected,
          }}
          />
          {amIPresenter && isPresentationEnabled && !isPresentationManagementDisabled && (
            <MediaButton
              dataTest="managePresentations"
              color={hasPresentation ? 'active' : 'default'}
              showSettingsIcon
              text={intl.formatMessage(intlMessages.mediaSharingSlides)}
              // @ts-ignore - jsx code
              icon={(<Icon iconName="file" color={hasPresentation ? colorPrimary : undefined} />)}
              onClick={handlePresentationClick}
            />
          )}
          {amIPresenter && allowExternalVideo && (
            <MediaButton
              dataTest="shareExternalVideo"
              color={isSharingVideo ? 'primary' : 'default'}
              showSettingsIcon
              text={intl.formatMessage(intlMessages.mediaSharingVideoLink)}
              icon={<Icon iconName="external-video" />}
              onClick={handleExternalVideoClick}
            />
          )}
          {isCameraAsContentEnabled && amIPresenter && (
            <MediaButton
              dataTest="cameraAsContent"
              color={hasCameraAsContent ? 'primary' : 'default'}
              text={intl.formatMessage(intlMessages.shareCameraAsContent)}
              icon={<Icon iconName="video" />}
              onClick={handleCameraAsContentClick}
            />
          )}
          {mediaAreaItems
            .filter((item) => item.allowed && item.type === MediaAreaItemType.OPTION)
            .map((item) => (
              <MediaButton
                key={item.id}
                dataTest={item.dataTest}
                color="default"
                text={item.label || ''}
                icon={item.icon ? <Icon iconName={item.icon} /> : undefined}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  handleClose();
                }}
              />
            ))}
        </Styled.MediaGrid>
      );
    }

    let subViewTitle = '';
    let subViewIcon: React.ReactNode = null;
    let subViewSpecificContent: React.ReactNode = null;

    if (currentView === 'presentation') {
      subViewTitle = intl.formatMessage(intlMessages.presentationLabel);
      subViewIcon = <Icon iconName="file" />;
      subViewSpecificContent = (
        <PresentationUploaderContainer
          amIPresenter={amIPresenter}
          onActionCompleted={handleBackClick}
          setPresentationFitToWidth={setPresentationFitToWidth}
        />
      );
    } else if (currentView === 'externalVideo') {
      subViewTitle = intl.formatMessage(intlMessages.startExternalVideoLabel);
      subViewIcon = <Icon iconName="external-video" />;
      subViewSpecificContent = (
        <ExternalVideoView
          intl={intl}
          onActionCompleted={handleBackClick}
          isSharingVideo={isSharingVideo}
          stopExternalVideoShare={stopExternalVideoShare}
        />
      );
    } else if (currentView === 'cameraAsContent') {
      subViewTitle = intl.formatMessage(intlMessages.cameraAsContentSettingsTitle);
      subViewIcon = <Icon iconName="video" />;
      subViewSpecificContent = (
        <CameraAsContentView
          intl={intl}
          hasCameraAsContent={hasCameraAsContent}
          onActionCompleted={handleBackClick}
          stopExternalVideoShare={stopExternalVideoShare}
        />
      );
    }

    if (subViewSpecificContent) {
      return (
        <Styled.SubViewWrapper>
          <Styled.SubHeader>
            <IconButton onClick={handleBackClick} size="small">
              <Styled.BackButtonIcon />
            </IconButton>
            <Styled.SubHeaderTitle>{subViewTitle}</Styled.SubHeaderTitle>
            {subViewIcon && <Styled.SubHeaderIconContainer>{subViewIcon}</Styled.SubHeaderIconContainer>}
          </Styled.SubHeader>
          <Styled.SubViewContent>
            {subViewSpecificContent}
          </Styled.SubViewContent>
        </Styled.SubViewWrapper>
      );
    }

    return null;
  };

  const renderTakePresenterView = () => {
    return (
      <Styled.BecomePresenterViewContainer>
        <Styled.BecomePresenterText>
          {intl.formatMessage(intlMessages.mustBePresenter)}
        </Styled.BecomePresenterText>
        <Styled.ConfirmationButton
          data-test="takePresenterButton"
          label={intl.formatMessage(intlMessages.takePresenter)}
          color="primary"
          onClick={handleTakePresenter}
          customIcon={<CoPresentIcon />}
        />
      </Styled.BecomePresenterViewContainer>
    );
  };

  let stopSharingAction = null;
  if (isScreenGloballyBroadcasting || hasCameraAsContent) {
    stopSharingAction = screenshareHasEnded;
  } else if (isSharingVideo) {
    stopSharingAction = stopExternalVideoShare;
  }

  let stopSharingIcon = null;
  if (isScreenGloballyBroadcasting) {
    stopSharingIcon = 'desktop_off';
  } else if (isSharingVideo) {
    stopSharingIcon = 'external-video_off';
  } else if (hasCameraAsContent) {
    stopSharingIcon = 'video_off';
  }

  const isSharing = isSharingVideo || hasCameraAsContent || isScreenGloballyBroadcasting;

  return (
    <Styled.Overlay onClick={handleClose}>
      {/* Stop propagation so that clicking inside the modal doesn't close it */}
      <Styled.ModalContainer
        onClick={(e) => e.stopPropagation()}
        isMobile={isMobile}
        isRTL={isRTL}
        actionsBarHeight={actionsBarStyle.height}
        reducedWidth={!amIPresenter && amIModerator}
      >
        {!amIPresenter && amIModerator
          ? renderTakePresenterView()
          : (
            <>
              <Styled.HeaderContainer>
                <h2>{intl.formatMessage(intlMessages.mediaSharingTitle)}</h2>
                <IconButton onClick={handleClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Styled.HeaderContainer>

              <Styled.ContentContainer>
                {renderContent()}
              </Styled.ContentContainer>

              {currentView === 'main' && isSharing && (
                <Styled.FooterContainer>
                  <Styled.ConfirmationButton
                    data-test="StopSharing"
                    label={`${intl.formatMessage(intlMessages.stopSharingLabel)}`}
                    color="danger"
                    disabled={!isSharingVideo && !hasCameraAsContent && !isScreenGloballyBroadcasting}
                    onClick={stopSharingAction}
                    icon={stopSharingIcon}
                  />
                </Styled.FooterContainer>
              )}
            </>
          )}
      </Styled.ModalContainer>
    </Styled.Overlay>
  );
};

export default MediaSharingModal;
