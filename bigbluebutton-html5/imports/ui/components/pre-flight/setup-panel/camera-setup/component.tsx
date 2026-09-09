import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ProfileStyled from '/imports/ui/components/profile-settings/styles';
import Styled from '../../styles';
import {
  CameraBrightnessInput,
  CameraDeviceSelector,
  CameraQualitySelector,
  CameraVirtualBackground,
} from '/imports/ui/components/camera-settings/component';
import { usePreFlight } from '../../context';
import PreviewService from '/imports/ui/components/video-preview/service';
import VideoService from '/imports/ui/components/video-provider/service';
import useVideoPreview from '/imports/ui/components/video-preview/hooks/useVideoPreview';
import {
  EFFECT_TYPES,
  getSessionVirtualBackgroundInfo,
} from '/imports/ui/services/virtual-background/service';
import getVirtualBackgroundAvailability from '../../features';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';

const intlMessages: { [key: string]: { id: string; description?: string } } = defineMessages({
  findingWebcamsLabel: {
    id: 'app.videoPreview.findingWebcamsLabel',
    description: 'Finding webcams label',
  },
  enableCameraLabel: {
    id: 'app.preFlight.enableCameraLabel',
    description: 'Label for the camera toggle when the camera is disabled',
  },
  disableCameraLabel: {
    id: 'app.preFlight.disableCameraLabel',
    description: 'Label for the camera toggle when the camera is enabled',
  },
  cameraDisabledLabel: {
    id: 'app.preFlight.cameraDisabledLabel',
    description: 'Placeholder shown in the preview when the camera is disabled',
  },
});

interface CameraSetupProps {
  micControl: React.ReactNode;
  // Rendered above the camera sections: preview, username, audio, then camera.
  children: React.ReactNode;
}

const CameraSetup: React.FC<CameraSetupProps> = ({ micControl, children }) => {
  const { formatMessage } = useIntl();
  const { shareCamera, setShareCamera, commitCameraRef } = usePreFlight();

  const { isVirtualBackgroundsEnabled, isCustomVirtualBackgroundsEnabled } = getVirtualBackgroundAvailability();

  const settingsStorage = window.meetingClientSettings.public.app.userSettingsStorage;
  const lastUsedWebcamDeviceId = useStorageKey('WebcamDeviceId', settingsStorage) as string || null;

  // Enumerating on mount would light up the camera behind a toggle reading "off".
  const camerasInitialized = useRef(shareCamera);

  const {
    webcamDeviceId,
    virtualBackgroundActive,
    availableWebcams,
    selectedProfile,
    viewState,
    deviceError,
    previewError,
    isCameraLoading,
    brightness,
    videoRef,
    currentVideoStream,
    VIEW_STATES,
    handleSelectWebcam,
    handleSelectProfile,
    handleVirtualBgSelected,
    setCameraBrightness,
    stopVirtualBackground,
    applyStoredVirtualBg,
    updateVirtualBackgroundInfo,
    updateCameraBrightnessInfo,
    getInitialCameraStream,
    terminateCameraStream,
    cleanupStreamAndVideo,
    displayPreview,
    initializeCameras,
  } = useVideoPreview({
    initialDeviceId: lastUsedWebcamDeviceId,
    initialProfileId: PreviewService.getDefaultProfile()?.id ?? '',
    isCameraShared: false,
    forceOpen: true,
    deferInitialization: !camerasInitialized.current,
  });

  const [virtualBackgroundChecked, setVirtualBackgroundChecked] = useState(() => {
    const vbgInfo = lastUsedWebcamDeviceId ? getSessionVirtualBackgroundInfo(lastUsedWebcamDeviceId) : null;
    return !!vbgInfo && vbgInfo.type !== EFFECT_TYPES.NONE_TYPE;
  });

  useEffect(() => {
    if (virtualBackgroundActive !== virtualBackgroundChecked) {
      setVirtualBackgroundChecked(virtualBackgroundActive);
    }
  }, [virtualBackgroundActive]);

  useEffect(() => {
    commitCameraRef.current = () => {
      if (!webcamDeviceId) return;
      PreviewService.changeWebcam(webcamDeviceId);
      if (selectedProfile) PreviewService.changeProfile(selectedProfile);
      updateVirtualBackgroundInfo();
      updateCameraBrightnessInfo();
    };

    return () => {
      commitCameraRef.current = null;
    };
  }, [webcamDeviceId, selectedProfile, updateVirtualBackgroundInfo, updateCameraBrightnessInfo]);

  const handleToggleCamera = useCallback(() => {
    if (shareCamera) {
      terminateCameraStream(currentVideoStream.current, webcamDeviceId);
      cleanupStreamAndVideo();
      setShareCamera(false);
      return;
    }

    setShareCamera(true);

    // First enable: the enumeration deferred at mount runs now and acquires the
    // stream itself.
    if (!camerasInitialized.current) {
      camerasInitialized.current = true;
      initializeCameras();
      return;
    }

    getInitialCameraStream(webcamDeviceId).then(() => displayPreview());
  }, [
    shareCamera,
    webcamDeviceId,
    terminateCameraStream,
    cleanupStreamAndVideo,
    getInitialCameraStream,
    initializeCameras,
    displayPreview,
    setShareCamera,
  ]);

  const handleVirtualBgChange = useCallback((checked: boolean) => {
    setVirtualBackgroundChecked(checked);

    if (!checked) {
      stopVirtualBackground(currentVideoStream.current);
      return;
    }

    applyStoredVirtualBg(webcamDeviceId);
  }, [stopVirtualBackground, applyStoredVirtualBg, webcamDeviceId]);

  const renderWebcamPreview = () => {
    const Settings = getSettingsSingletonInstance();
    const { animations } = Settings.application;

    const containerStyle = {
      width: '60%',
      height: '25vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    return (
      <ProfileStyled.VideoPreviewContainer>
        <ProfileStyled.VideoPreviewWrapper>
          {(() => {
            if (!shareCamera) {
              return (
                <ProfileStyled.VideoPreviewContent>
                  <ProfileStyled.VideoCol>
                    <div style={containerStyle}>
                      <span>{formatMessage(intlMessages.cameraDisabledLabel)}</span>
                    </div>
                  </ProfileStyled.VideoCol>
                </ProfileStyled.VideoPreviewContent>
              );
            }

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
                      {previewError
                        ? <div style={containerStyle}>{previewError}</div>
                        : (
                          <ProfileStyled.VideoPreview
                            mirroredVideo={VideoService.mirrorOwnWebcam()}
                            id="preview"
                            data-test={VideoService.mirrorOwnWebcam() ? 'mirroredVideoPreview' : 'videoPreview'}
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                          />
                        )}
                    </ProfileStyled.VideoCol>
                  </ProfileStyled.VideoPreviewContent>
                );
            }
          })()}
          <Styled.PreviewControls>
            {micControl}
            <Styled.PreviewControlButton
              $active={shareCamera}
              onClick={handleToggleCamera}
              aria-label={formatMessage(shareCamera
                ? intlMessages.disableCameraLabel
                : intlMessages.enableCameraLabel)}
              data-test="preFlightCameraToggle"
            >
              {shareCamera ? <VideocamIcon /> : <VideocamOffIcon />}
            </Styled.PreviewControlButton>
          </Styled.PreviewControls>
        </ProfileStyled.VideoPreviewWrapper>
      </ProfileStyled.VideoPreviewContainer>
    );
  };

  return (
    <>
      {renderWebcamPreview()}
      <ProfileStyled.ProfileSettings>
        {children}
        <ProfileStyled.Separator />
        <ProfileStyled.DevicesSettingsContainer>
          <ProfileStyled.DeviceContainer>
            <ProfileStyled.IconCamera />
            <CameraDeviceSelector
              devices={availableWebcams}
              value={!previewError ? webcamDeviceId || '' : ''}
              onChange={(deviceId) => handleSelectWebcam({
                target: { value: deviceId },
              } as React.ChangeEvent<HTMLSelectElement>)}
              disabled={!shareCamera}
              dataTest="preFlightCameraDevice"
            />
          </ProfileStyled.DeviceContainer>
          <ProfileStyled.DeviceContainer>
            <ProfileStyled.WbSunnyIcon />
            <CameraBrightnessInput
              brightness={brightness}
              onChange={(value) => setCameraBrightness(value, webcamDeviceId)}
              disabled={!shareCamera || isCameraLoading}
            />
          </ProfileStyled.DeviceContainer>
          <ProfileStyled.DeviceContainer>
            <CameraQualitySelector
              value={selectedProfile || ''}
              onChange={handleSelectProfile}
              disabled={!shareCamera}
              dataTest="preFlightCameraQuality"
            />
          </ProfileStyled.DeviceContainer>
        </ProfileStyled.DevicesSettingsContainer>
        {isVirtualBackgroundsEnabled && shareCamera && (
          <ProfileStyled.VirtualBackgroundContainer>
            <CameraVirtualBackground
              checked={virtualBackgroundChecked}
              onCheckedChange={handleVirtualBgChange}
              onSelected={(type, name, customParams) => handleVirtualBgSelected(
                type, name, customParams, webcamDeviceId,
              )}
              initialState={(webcamDeviceId && getSessionVirtualBackgroundInfo(webcamDeviceId))
                || { type: EFFECT_TYPES.NONE_TYPE, name: 'None' }}
              isCustomVirtualBackgroundsEnabled={isCustomVirtualBackgroundsEnabled}
              locked={isCameraLoading}
              hideNotificationToasts
            />
          </ProfileStyled.VirtualBackgroundContainer>
        )}
      </ProfileStyled.ProfileSettings>
    </>
  );
};

export default CameraSetup;
