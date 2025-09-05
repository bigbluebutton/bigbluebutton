import React, { useEffect, useState } from 'react';
import { IntlShape, defineMessages } from 'react-intl';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Styled from './styles';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import logger from '/imports/startup/client/logger';
import { SCREENSHARING_ERRORS } from '/imports/api/screenshare/client/bridge/errors';
import VideoService from '/imports/ui/components/video-provider/service';
import PreviewService from '/imports/ui/components/video-preview/service';
import ProfileStyled from '/imports/ui/components/profile-settings/styles';
import ModalStyled from '../styles';
import * as ScreenShareService from '/imports/ui/components/screenshare/service';
import { useStopVideo, useStreams } from '/imports/ui/components/video-provider/hooks';
import { useVideoPreview } from '/imports/ui/components/video-preview/hooks/useVideoPreview';
import BBBVideoStream from '/imports/ui/services/webrtc-base/bbb-video-stream';

interface CameraAsContentViewProps {
  intl: IntlShape;
  onActionCompleted: () => void;
  hasCameraAsContent: boolean;
  stopExternalVideoShare: () => void;
}

const intlMessages: { [key: string]: { id: string; description?: string } } = defineMessages({
  cameraLabel: {
    id: 'app.videoPreview.cameraLabel',
    description: 'Camera dropdown label',
  },
  findingWebcamsLabel: {
    id: 'app.videoPreview.findingWebcamsLabel',
    description: 'Finding webcams label',
  },
  webcamNotFoundLabel: {
    id: 'app.videoPreview.webcamNotFoundLabel',
    description: 'Webcam not found label',
  },
  shareLabel: {
    id: 'app.mediaSharing.modal.share',
    description: 'Label for the share button in the sharing media modal',
  },
  stopSharingLabel: {
    id: 'app.mediaSharing.modal.stopSharing',
    description: 'Label for the stop sharing button in the sharing media modal',
  },
});

const CameraAsContentView: React.FC<CameraAsContentViewProps> = ({
  intl,
  hasCameraAsContent,
  onActionCompleted,
  stopExternalVideoShare,
}) => {
  const { formatMessage } = intl;
  // @ts-ignore
  const settingsStorage = window.meetingClientSettings.public.app.userSettingsStorage;
  const initialWebcamDeviceId = useStorageKey('WebcamDeviceId', settingsStorage) as string || null;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const allStreams = useStreams();
  const stopVideo = useStopVideo();

  const {
    webcamDeviceId,
    availableWebcams,
    viewState,
    deviceError,
    previewError,
    isCameraLoading,
    videoRef,
    currentVideoStream,
    VIEW_STATES,
    handleSelectWebcam,
    cleanupStreamAndVideo,
    setCurrentVideoStream,
    initializeCameras,
  } = useVideoPreview({
    initialDeviceId: initialWebcamDeviceId,
    initialProfileId: PreviewService.getCameraAsContentProfile()?.id || '',
    isCameraAsContent: true,
  });

  function renderWebcamPreview(): React.ReactNode {
    const Settings = getSettingsSingletonInstance();
    const { animations } = Settings.application;

    const containerStyle = {
      width: '60%',
      height: '25vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    switch (viewState) {
      case VIEW_STATES.finding:
        return (
          <ProfileStyled.VideoPreviewContent>
            <ProfileStyled.VideoCol>
              <div style={containerStyle}>
                <span>{formatMessage(intlMessages.findingWebcamsLabel)}</span>
                <ProfileStyled.FetchingAnimation animations={animations} />
              </div>
            </ProfileStyled.VideoCol>
          </ProfileStyled.VideoPreviewContent>
        );
      case VIEW_STATES.error:
        return (
          <ProfileStyled.VideoPreviewContent>
            <ProfileStyled.VideoCol><div>{deviceError}</div></ProfileStyled.VideoCol>
          </ProfileStyled.VideoPreviewContent>
        );
      case VIEW_STATES.found:
      default:
        return (
          <ProfileStyled.VideoPreviewContent>
            <ProfileStyled.VideoCol>
              {
                previewError
                  ? (
                    <div>{previewError}</div>
                  )
                  : (
                    <ProfileStyled.VideoPreview
                      mirroredVideo={false}
                      id="preview"
                      data-test="videoPreview"
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                    />
                  )
              }
            </ProfileStyled.VideoCol>
          </ProfileStyled.VideoPreviewContent>
        );
    }
  }

  const startCameraAsContent = () => {
    const videoStream = currentVideoStream.current;

    if (!videoStream?.mediaStream) {
      logger.error({
        logCode: 'camera_as_content_missing_stream',
        extraInfo: { deviceId: webcamDeviceId },
      }, 'Camera as content failed: preview stream is not available at sharing time.');
      initializeCameras();
      return;
    }

    PreviewService.storeStream(webcamDeviceId, videoStream);

    const handleFailure = (error: unknown) => {
      const {
        // @ts-ignore - jsx code
        errorCode = SCREENSHARING_ERRORS.UNKNOWN_ERROR.errorCode,
        errorMessage = (error as Error).message,
      } = error as { errorCode?: number, errorMessage?: string };

      logger.error({
        logCode: 'camera_as_content_failed',
        extraInfo: { errorCode, errorMessage },
      }, `Sharing camera as content failed: ${errorMessage} (code=${errorCode})`);

      ScreenShareService.screenshareHasEnded();
    };

    ScreenShareService.shareScreen(
      hasCameraAsContent,
      stopExternalVideoShare,
      // eslint-disable-next-line no-underscore-dangle
      true,
      handleFailure,
      { stream: videoStream.mediaStream },
    );

    ScreenShareService.setCameraAsContentDeviceId(webcamDeviceId);
    // save in storage as last used webcam
    PreviewService.changeWebcam(webcamDeviceId);
    cleanupStreamAndVideo();
    onActionCompleted();
  };

  useEffect(() => {
    if (!isTransitioning) return;

    const isTargetStreamActive = allStreams.some((s) => VideoService.isLocalStream(s.stream)
    && s.deviceId === webcamDeviceId);

    if (!isTargetStreamActive) {
      logger.debug({
        logCode: 'camera_as_content_transition_safe',
        extraInfo: { deviceId: webcamDeviceId },
      }, 'Target video stream is confirmed stopped. Proceeding to share as content.');

      startCameraAsContent();
      setIsTransitioning(false);
    }
  }, [isTransitioning, allStreams, webcamDeviceId]);

  // Clones the current video stream via a Media Stream API clone.
  // The cloned stream substitutes the previous one in the component's ref.
  // This method should only be used in scenarios where there are
  // competing users of the same media stream - e.g.:
  // video-provider and camera-as-content. Otherwise, this component may
  // lose the stream if a secondary one releases it.
  const clonePreviewStream = () => {
    if (!currentVideoStream?.current?.originalStream) {
      logger.error({
        logCode: 'camera_as_content_clone_failed',
      }, 'Failed to clone preview stream: stream is missing.');
      return;
    }

    const cloned = currentVideoStream.current.originalStream.clone();
    const newStream = new BBBVideoStream(cloned);
    setCurrentVideoStream(newStream);
  };

  return (
    <>
      <Styled.Content>
        {renderWebcamPreview()}
        <ProfileStyled.DeviceContainer>
          <ProfileStyled.IconCamera />
          {availableWebcams && availableWebcams.length > 0
            ? (
              <ProfileStyled.DeviceSelector
                value={webcamDeviceId || ''}
                onChange={(e) => handleSelectWebcam(e as unknown as React.ChangeEvent<HTMLSelectElement>)}
                IconComponent={ExpandMoreIcon}
              >
                {availableWebcams.map((webcam, index) => (
                  <MenuItem key={webcam.deviceId} value={webcam.deviceId}>
                    {webcam.label || `${formatMessage(intlMessages.cameraLabel)} ${index}`}
                  </MenuItem>
                ))}
              </ProfileStyled.DeviceSelector>
            )
            : <span>{formatMessage(intlMessages.webcamNotFoundLabel)}</span>}
        </ProfileStyled.DeviceContainer>
      </Styled.Content>
      <ModalStyled.FooterContainer>
        <ModalStyled.ConfirmationButton
          data-test={!hasCameraAsContent ? 'StartCameraAsContent' : 'StopCameraAsContent'}
          label={!hasCameraAsContent
            ? formatMessage(intlMessages.shareLabel) : formatMessage(intlMessages.stopSharingLabel)}
          color={!hasCameraAsContent ? 'primary' : 'danger'}
          onClick={async () => {
            if (hasCameraAsContent) {
              ScreenShareService.screenshareHasEnded();
              initializeCameras();
              return;
            }

            if (isTransitioning) return;

            const myActiveStreams = allStreams.filter((s) => VideoService.isLocalStream(s.stream));
            const targetStream = myActiveStreams.find((s) => s.deviceId === webcamDeviceId);
            if (targetStream) {
              clonePreviewStream();

              logger.debug({
                logCode: 'camera_as_content_transition_start',
                extraInfo: { streamToStop: targetStream.stream },
              }, 'Matching camera stream found. Transitioning to content share.');

              setIsTransitioning(true);
              stopVideo(targetStream.stream);
            } else {
              logger.debug({ logCode: 'camera_as_content_no_video' }, 'No active video matching preview. Sharing as content directly.');
              startCameraAsContent();
            }
          }}
          disabled={isCameraLoading || !availableWebcams || availableWebcams.length === 0 || isTransitioning}
          icon={hasCameraAsContent ? 'video_off' : undefined}
        />
      </ModalStyled.FooterContainer>
    </>
  );
};

export default CameraAsContentView;
