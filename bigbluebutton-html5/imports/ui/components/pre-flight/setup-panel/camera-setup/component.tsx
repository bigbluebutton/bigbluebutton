import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ProfileStyled from '/imports/ui/components/profile-settings/styles';
import CameraPreview from '/imports/ui/components/media-setup/camera-preview/component';
import Styled from '../../styles';
import {
  CameraBrightnessInput,
  CameraDeviceSelector,
  CameraQualitySelector,
  CameraVirtualBackground,
} from '/imports/ui/components/camera-settings/component';
import { usePreFlight } from '../../context';
import PreviewService from '/imports/ui/components/video-preview/service';
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
  const {
    shareCamera, setShareCamera, cameraFailed, setCameraFailed, commitCameraRef,
  } = usePreFlight();

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
    invalidateCameraAcquisition,
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
    // A failed preview reads as off on the toggle, so a click retries it
    // instead of turning off a camera the user cannot see.
    if (shareCamera && !cameraFailed) {
      invalidateCameraAcquisition();
      terminateCameraStream(currentVideoStream.current);
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

    // A null device means the acquisition was dropped meanwhile.
    getInitialCameraStream(webcamDeviceId).then((deviceId) => {
      if (deviceId) displayPreview();
    });
  }, [
    shareCamera,
    cameraFailed,
    webcamDeviceId,
    invalidateCameraAcquisition,
    terminateCameraStream,
    cleanupStreamAndVideo,
    getInitialCameraStream,
    initializeCameras,
    displayPreview,
    setShareCamera,
  ]);

  useEffect(() => {
    if (shareCamera || isCameraLoading || !currentVideoStream.current) return;
    terminateCameraStream(currentVideoStream.current);
    cleanupStreamAndVideo();
  }, [
    shareCamera,
    isCameraLoading,
    viewState,
    webcamDeviceId,
    terminateCameraStream,
    cleanupStreamAndVideo,
  ]);

  const hasCameraError = shareCamera && (viewState === VIEW_STATES.error || !!previewError);

  // An empty device list only means "no webcam" once the enumeration has run.
  let emptyDeviceLabel;
  if (!shareCamera) emptyDeviceLabel = formatMessage(intlMessages.cameraDisabledLabel);
  else if (viewState === VIEW_STATES.finding) emptyDeviceLabel = formatMessage(intlMessages.findingWebcamsLabel);

  useEffect(() => {
    setCameraFailed(hasCameraError);
  }, [hasCameraError]);

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

    return (
      <CameraPreview
        viewState={viewState}
        videoRef={videoRef}
        findingLabel={formatMessage(intlMessages.findingWebcamsLabel)}
        animations={animations}
        statusContainer={Styled.PreviewPlaceholder}
        deviceError={deviceError}
        previewError={previewError}
        placeholder={!shareCamera ? formatMessage(intlMessages.cameraDisabledLabel) : null}
      >
        <Styled.PreviewControls>
          {micControl}
          <Styled.PreviewControlButton
            $active={shareCamera && !cameraFailed}
            onClick={handleToggleCamera}
            aria-label={formatMessage(shareCamera && !cameraFailed
              ? intlMessages.disableCameraLabel
              : intlMessages.enableCameraLabel)}
            data-test="preFlightCameraToggle"
          >
            {shareCamera && !cameraFailed ? <VideocamIcon /> : <VideocamOffIcon />}
          </Styled.PreviewControlButton>
        </Styled.PreviewControls>
      </CameraPreview>
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
              emptyLabel={emptyDeviceLabel}
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
