import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  defineMessages, useIntl, FormattedMessage,
} from 'react-intl';
import VirtualBgSelector from '/imports/ui/components/video-preview/virtual-background/component';
import browserInfo from '/imports/utils/browserInfo';
import { MutationFunction } from '@apollo/client';
import PreviewService from './service';
import VideoService from '/imports/ui/components/video-provider/service';
import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';
import {
  EFFECT_TYPES,
  isVirtualBackgroundSupported,
  getSessionVirtualBackgroundInfoWithDefault,
} from '/imports/ui/services/virtual-background/service';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Checkbox from '/imports/ui/components/common/checkbox/component';
import AppService from '/imports/ui/components/app/service';
import Session from '/imports/ui/services/storage/in-memory';
import { useVideoPreview } from './hooks/useVideoPreview';
import { CameraProfileProps } from './hooks/types';

interface VideoPreviewProps {
  closeModal: () => void;
  startSharing: (deviceId: string) => void;
  stopSharing: (deviceId?: string) => void;
  startSharingCameraAsContent: (deviceId: string) => void;
  stopSharingCameraAsContent: () => void;
  resolve?: () => void;
  camCapReached?: boolean;
  hasVideoStream: boolean;
  webcamDeviceId: string | null;
  sharedDevices: string[];
  cameraAsContent?: boolean;
  cameraAsContentDeviceId?: string;
  isCamLocked?: boolean;
  forceOpen?: boolean;
  isOpen: boolean;
  priority?: number;
  isVirtualBackgroundsEnabled: boolean;
  isCustomVirtualBackgroundsEnabled: boolean;
  hideNotificationToasts?: boolean;
  setAway: MutationFunction;
  isAway: boolean;
}

const intlMessages: { [key: string]: { id: string; description?: string } } = defineMessages({
  webcamVirtualBackgroundTitle: {
    id: 'app.videoPreview.webcamVirtualBackgroundLabel',
    description: 'Title for the virtual background modal',
  },
  webcamSettingsTitle: {
    id: 'app.videoPreview.webcamSettingsTitle',
    description: 'Title for the video preview modal',
  },
  cancelLabel: {
    id: 'app.mobileAppModal.dismissLabel',
    description: 'Close button label',
  },
  cameraLabel: {
    id: 'app.videoPreview.cameraLabel',
    description: 'Camera dropdown label',
  },
  qualityLabel: {
    id: 'app.videoPreview.profileLabel',
    description: 'Quality dropdown label',
  },
  low: {
    id: 'app.videoPreview.quality.low',
    description: 'Low quality option label',
  },
  medium: {
    id: 'app.videoPreview.quality.medium',
    description: 'Medium quality option label',
  },
  high: {
    id: 'app.videoPreview.quality.high',
    description: 'High quality option label',
  },
  hd: {
    id: 'app.videoPreview.quality.hd',
    description: 'High definition option label',
  },
  startSharingLabel: {
    id: 'app.videoPreview.startSharingLabel',
    description: 'Start sharing button label',
  },
  stopSharingLabel: {
    id: 'app.videoPreview.stopSharingLabel',
    description: 'Stop sharing button label',
  },
  stopSharingAllLabel: {
    id: 'app.videoPreview.stopSharingAllLabel',
    description: 'Stop sharing all button label',
  },
  sharedCameraLabel: {
    id: 'app.videoPreview.sharedCameraLabel',
    description: 'Already Shared camera label',
  },
  findingWebcamsLabel: {
    id: 'app.videoPreview.findingWebcamsLabel',
    description: 'Finding webcams label',
  },
  webcamNotFoundLabel: {
    id: 'app.videoPreview.webcamNotFoundLabel',
    description: 'Webcam not found label',
  },
  profileNotFoundLabel: {
    id: 'app.videoPreview.profileNotFoundLabel',
    description: 'Profile not found label',
  },
  iOSError: {
    id: 'app.audioModal.iOSBrowser',
    description: 'Audio/Video Not supported warning',
  },
  iOSErrorDescription: {
    id: 'app.audioModal.iOSErrorDescription',
    description: 'Audio/Video not supported description',
  },
  iOSErrorRecommendation: {
    id: 'app.audioModal.iOSErrorRecommendation',
    description: 'Audio/Video recommended action',
  },
  camCapReached: {
    id: 'app.video.camCapReached',
    description: 'message for when the camera cap has been reached',
  },
  brightness: {
    id: 'app.videoPreview.brightness',
    description: 'Brightness label',
  },
  wholeImageBrightnessLabel: {
    id: 'app.videoPreview.wholeImageBrightnessLabel',
    description: 'Whole image brightness label',
  },
  wholeImageBrightnessDesc: {
    id: 'app.videoPreview.wholeImageBrightnessDesc',
    description: 'Whole image brightness aria description',
  },
  cameraAsContentSettingsTitle: {
    id: 'app.videoPreview.cameraAsContentSettingsTitle',
    description: 'Title for the video preview modal when sharing camera as content',
  },
  sliderDesc: {
    id: 'app.videoPreview.sliderDesc',
    description: 'Brightness slider aria description',
  },
});

const VideoPreview: React.FC<VideoPreviewProps> = ({
  closeModal,
  startSharing,
  stopSharing,
  startSharingCameraAsContent,
  stopSharingCameraAsContent,
  resolve,
  camCapReached = true,
  hasVideoStream,
  webcamDeviceId: initialWebcamDeviceId,
  sharedDevices = [],
  cameraAsContent = false,
  cameraAsContentDeviceId,
  isCamLocked = false,
  forceOpen = false,
  isOpen,
  priority,
  isVirtualBackgroundsEnabled,
  isCustomVirtualBackgroundsEnabled,
  hideNotificationToasts = false,
  setAway,
  isAway,
}) => {
  const intl = useIntl();
  const [selectedTab, setSelectedTab] = useState(0);
  const brightnessMarker = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  const isAlreadyShared = useCallback((webcamId: string | null) => webcamId
    && (sharedDevices.includes(webcamId) || webcamId === cameraAsContentDeviceId),
  [sharedDevices, cameraAsContentDeviceId]);

  const {
    webcamDeviceId,
    availableWebcams,
    selectedProfile,
    viewState,
    deviceError,
    previewError,
    isCameraLoading,
    brightness,
    wholeImageBrightness,
    videoRef,
    currentVideoStream,
    VIEW_STATES,
    shouldSkipVideoPreview,
    handleSelectWebcam,
    handleSelectProfile,
    handleVirtualBgSelected,
    setCameraBrightness,
    handleBrightnessAreaChange,
    stopVirtualBackground,
    terminateCameraStream,
    cleanupStreamAndVideo,
    handleStartSharing,
  } = useVideoPreview({
    initialDeviceId: initialWebcamDeviceId,
    initialProfileId: !cameraAsContent
      ? PreviewService.getDefaultProfile()?.id || ''
      : PreviewService.getCameraAsContentProfile()?.id || '',
    isCameraAsContent: cameraAsContent,
    isCameraShared: !!isAlreadyShared(initialWebcamDeviceId),
    forceOpen,
    startSharing,
    startSharingCameraAsContent,
  });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      Session.setItem('videoPreviewFirstOpen', false);
    };
  }, []);

  useEffect(() => {
    if (brightnessMarker.current) {
      const markerStyle = window.getComputedStyle(brightnessMarker.current);
      const left = parseFloat(markerStyle.left);
      const right = parseFloat(markerStyle.right);

      if (left < 0) {
        brightnessMarker.current.style.left = '0px';
        brightnessMarker.current.style.right = 'auto';
      } else if (right < 0) {
        brightnessMarker.current.style.right = '0px';
        brightnessMarker.current.style.left = 'auto';
      }
    }
  }, [brightness]);

  const isCameraAsContentDevice = useCallback(
    (deviceId: string | null) => deviceId === cameraAsContentDeviceId,
    [cameraAsContentDeviceId],
  );

  const handleStopSharing = useCallback(() => {
    if (isCameraAsContentDevice(webcamDeviceId)) {
      stopSharingCameraAsContent();
    } else {
      PreviewService.deleteStream(webcamDeviceId as string);
      stopSharing(webcamDeviceId as string);
      cleanupStreamAndVideo();
    }
    if (resolve) resolve();
  }, [
    webcamDeviceId,
    isCameraAsContentDevice,
    stopSharing,
    stopSharingCameraAsContent,
    cleanupStreamAndVideo,
    resolve,
  ]);

  const handleStopSharingAll = useCallback(() => {
    stopSharing();
    if (resolve) resolve();
  }, [stopSharing, resolve]);

  const handleProceed = useCallback(() => {
    const shared = isAlreadyShared(webcamDeviceId);

    if (
      shared
      && currentVideoStream.current?.virtualBgService
      && brightness === 100
      && currentVideoStream.current?.virtualBgType === EFFECT_TYPES.NONE_TYPE
    ) {
      stopVirtualBackground(currentVideoStream.current);
    }

    terminateCameraStream(currentVideoStream.current, webcamDeviceId);
    closeModal();
    if (resolve) resolve();
  }, [
    webcamDeviceId,
    isAlreadyShared,
    currentVideoStream,
    brightness,
    stopVirtualBackground,
    terminateCameraStream,
    closeModal,
    resolve,
  ]);

  useEffect(() => {
    if (isCamLocked === true) handleProceed();
  }, [isCamLocked, handleProceed]);

  const getFallbackLabel = useCallback((index: number) => {
    return `${intl.formatMessage(intlMessages.cameraLabel)} ${index}`;
  }, [intl]);

  const renderQualitySelector = () => {
    const shared = isAlreadyShared(webcamDeviceId);

    if (shared) {
      return (
        <Styled.Label>
          {intl.formatMessage(intlMessages.sharedCameraLabel)}
        </Styled.Label>
      );
    }

    if (cameraAsContent) return null;

    // @ts-ignore
    const CAMERA_PROFILES = (window.meetingClientSettings.public.kurento.cameraProfiles || []) as CameraProfileProps[];
    const PREVIEW_CAMERA_PROFILES = CAMERA_PROFILES.filter((p) => !p.hidden);

    return (
      <>
        <Styled.Label htmlFor="setQuality">
          {intl.formatMessage(intlMessages.qualityLabel)}
        </Styled.Label>
        {PREVIEW_CAMERA_PROFILES.length > 0
          ? (
            <Styled.Select
              id="setQuality"
              value={selectedProfile || ''}
              onChange={handleSelectProfile}
            >
              {PREVIEW_CAMERA_PROFILES.map((profile: CameraProfileProps) => {
                const label = intlMessages[`${profile.id}`]
                  ? intl.formatMessage(intlMessages[`${profile.id}`])
                  : profile.name;

                return (
                  <option key={profile.id} value={profile.id}>
                    {`${label}`}
                  </option>
                );
              })}
            </Styled.Select>
          )
          : (
            <span>
              {intl.formatMessage(intlMessages.profileNotFoundLabel)}
            </span>
          )}
      </>
    );
  };

  const renderDeviceSelectors = () => (
    <Styled.InternCol>
      <Styled.Label htmlFor="setCam">
        {intl.formatMessage(intlMessages.cameraLabel)}
      </Styled.Label>
      {availableWebcams && availableWebcams.length > 0
        ? (
          <Styled.Select
            id="setCam"
            value={webcamDeviceId || ''}
            onChange={handleSelectWebcam}
          >
            {availableWebcams.map((webcam, index) => (
              <option key={webcam.deviceId} value={webcam.deviceId}>
                {webcam.label || getFallbackLabel(index)}
              </option>
            ))}
          </Styled.Select>
        )
        : (
          <span>
            {intl.formatMessage(intlMessages.webcamNotFoundLabel)}
          </span>
        )}
      {renderQualitySelector()}
    </Styled.InternCol>
  );

  const renderBrightnessInput = () => {
    // @ts-ignore
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    if (!ENABLE_CAMERA_BRIGHTNESS || cameraAsContent || isCameraAsContentDevice(webcamDeviceId)) return null;

    const origin = brightness <= 100 ? 'left' : 'right';
    const offset = origin === 'left'
      ? (brightness * 100) / 200
      : ((200 - brightness) * 100) / 200;

    return (
      <Styled.InternCol>
        <Styled.Label htmlFor="brightness">
          {intl.formatMessage(intlMessages.brightness)}
        </Styled.Label>
        <div aria-hidden>
          <Styled.MarkerDynamicWrapper>
            <Styled.MarkerDynamic
              ref={brightnessMarker}
              style={{ [origin]: `calc(${offset}% - 1rem)` }}
            >
              {brightness - 100}
            </Styled.MarkerDynamic>
          </Styled.MarkerDynamicWrapper>
        </div>
        <input
          id="brightness"
          style={{ width: '100%' }}
          type="range"
          min={0}
          max={200}
          value={brightness}
          aria-describedby="brightness-slider-desc"
          onChange={(e) => setCameraBrightness(e.target.valueAsNumber)}
          disabled={!isVirtualBackgroundSupported() || isCameraLoading}
        />
        <div style={{ display: 'none' }} id="brightness-slider-desc">
          {intl.formatMessage(intlMessages.sliderDesc)}
        </div>
        <Styled.MarkerWrapper aria-hidden>
          <Styled.Marker>-100</Styled.Marker>
          <Styled.Marker>0</Styled.Marker>
          <Styled.Marker>100</Styled.Marker>
        </Styled.MarkerWrapper>
        <div style={{ display: 'flex', marginTop: '.5rem' }}>
          <Checkbox
            onChange={handleBrightnessAreaChange}
            checked={wholeImageBrightness}
            ariaLabel={intl.formatMessage(intlMessages.wholeImageBrightnessLabel)}
            ariaDescribedBy="whole-image-desc"
            ariaDesc={intl.formatMessage(intlMessages.wholeImageBrightnessDesc)}
            disabled={!isVirtualBackgroundSupported() || isCameraLoading}
            label={intl.formatMessage(intlMessages.wholeImageBrightnessLabel)}
          />
        </div>
      </Styled.InternCol>
    );
  };

  const renderVirtualBgSelector = () => {
    const initialVirtualBgState = currentVideoStream.current ? {
      type: currentVideoStream.current.virtualBgType,
      name: currentVideoStream.current.virtualBgName,
      uniqueId: currentVideoStream.current.virtualBgUniqueId,
    } : getSessionVirtualBackgroundInfoWithDefault(webcamDeviceId);

    // @ts-ignore
    const { showThumbnails: SHOW_THUMBNAILS = true } = window.meetingClientSettings.public.virtualBackgrounds;

    return (
      <Styled.Fragment>
        <VirtualBgSelector
          handleVirtualBgSelected={handleVirtualBgSelected}
          locked={isCameraLoading}
          showThumbnails={SHOW_THUMBNAILS}
          initialVirtualBgState={initialVirtualBgState}
          isCustomVirtualBackgroundsEnabled={isCustomVirtualBackgroundsEnabled}
          renderSettingsLabel={false}
          hideNotificationToasts={hideNotificationToasts}
        />
      </Styled.Fragment>
    );
  };

  const renderTabsContent = () => {
    const shouldShowVirtualBackgrounds = isVirtualBackgroundsEnabled && !cameraAsContent;

    return (
      <Styled.ContentCol>
        {selectedTab === 0 && (
          <Styled.Col>
            {renderDeviceSelectors()}
            {isVirtualBackgroundSupported() && renderBrightnessInput()}
          </Styled.Col>
        )}
        {selectedTab === 1 && shouldShowVirtualBackgrounds && (
          <Styled.BgnCol>
            {renderVirtualBgSelector()}
          </Styled.BgnCol>
        )}
      </Styled.ContentCol>
    );
  };

  const renderContent = () => {
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
          <Styled.Content>
            <Styled.VideoCol>
              <div style={containerStyle}>
                <span>{intl.formatMessage(intlMessages.findingWebcamsLabel)}</span>
                <Styled.FetchingAnimation animations={animations} />
              </div>
            </Styled.VideoCol>
          </Styled.Content>
        );
      case VIEW_STATES.error:
        return (
          <Styled.Content>
            <Styled.VideoCol><div>{deviceError}</div></Styled.VideoCol>
          </Styled.Content>
        );
      case VIEW_STATES.found:
      default:
        return (
          <Styled.Content>
            <Styled.VideoCol>
              {previewError ? (
                <div>{previewError}</div>
              ) : (
                <Styled.VideoPreview
                  mirroredVideo={VideoService.mirrorOwnWebcam()}
                  id="preview"
                  data-test={VideoService.mirrorOwnWebcam() ? 'mirroredVideoPreview' : 'videoPreview'}
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                />
              )}
            </Styled.VideoCol>
            {renderTabsContent()}
          </Styled.Content>
        );
    }
  };

  const getModalTitle = () => (cameraAsContent
    ? intl.formatMessage(intlMessages.cameraAsContentSettingsTitle)
    : intl.formatMessage(intlMessages.webcamSettingsTitle));

  const renderModalContent = () => {
    const shouldDisableButtons = shouldSkipVideoPreview() || !!(deviceError || previewError);
    const shared = isAlreadyShared(webcamDeviceId);
    const showStopAllButton = hasVideoStream && VideoService.isMultipleCamerasEnabled();
    const { isIe } = browserInfo;

    return (
      <>
        {isIe && (
          <Styled.BrowserWarning>
            <FormattedMessage
              id="app.audioModal.unsupportedBrowserLabel"
              description="Warning when someone joins with a browser that isn't supported"
              values={{
                supportedBrowser1: <a href="https://www.google.com/chrome/">Chrome</a>,
                supportedBrowser2: <a href="https://getfirefox.com">Firefox</a>,
              }}
            />
          </Styled.BrowserWarning>
        )}
        {renderContent()}
        <Styled.Footer>
          <Styled.BottomSeparator />
          <Styled.FooterContainer showStopAllButton={showStopAllButton}>
            {showStopAllButton && (
              <Styled.ExtraActions>
                <Styled.StopAllButton
                  color="danger"
                  label={intl.formatMessage(intlMessages.stopSharingAllLabel)}
                  onClick={handleStopSharingAll}
                  disabled={shouldDisableButtons}
                />
              </Styled.ExtraActions>
            )}
            {!shared && camCapReached ? (
              <span>{intl.formatMessage(intlMessages.camCapReached)}</span>
            ) : (
              <div style={{ display: 'flex' }}>
                <Styled.CancelButton
                  data-test="cancelSharingWebcam"
                  label={intl.formatMessage(intlMessages.cancelLabel)}
                  onClick={closeModal}
                />
                <Styled.SharingButton
                  data-test="startSharingWebcam"
                  color={shared ? 'danger' : 'primary'}
                  label={intl.formatMessage(shared ? intlMessages.stopSharingLabel : intlMessages.startSharingLabel)}
                  onClick={() => {
                    if (shared) {
                      handleStopSharing();
                    } else {
                      handleStartSharing(webcamDeviceId as string);
                      if (isAway) {
                        setAway({
                          variables: {
                            away: false,
                          },
                        });
                      }
                    }
                  }}
                  disabled={isCameraLoading || shouldDisableButtons}
                />
              </div>
            )}
          </Styled.FooterContainer>
        </Styled.Footer>
      </>
    );
  };

  const supportWarning = () => (
    <div>
      <Styled.Warning>!</Styled.Warning>
      <Styled.Main>{intl.formatMessage(intlMessages.iOSError)}</Styled.Main>
      <Styled.Text>{intl.formatMessage(intlMessages.iOSErrorDescription)}</Styled.Text>
      <Styled.Text>{intl.formatMessage(intlMessages.iOSErrorRecommendation)}</Styled.Text>
    </div>
  );

  if (isCamLocked === true) return null;

  if (shouldSkipVideoPreview()) {
    return null;
  }

  const allowCloseModal = !!(deviceError || previewError) || !shouldSkipVideoPreview() || forceOpen;
  const shouldShowVirtualBackgroundsTab = isVirtualBackgroundsEnabled
    && !cameraAsContent
    && !isCameraAsContentDevice(webcamDeviceId)
    && isVirtualBackgroundSupported();

  // @ts-ignore
  const BASE_NAME = window.meetingClientSettings.public.app.basename;
  const WebcamSettingsImg = `${BASE_NAME}/resources/images/webcam_settings.svg`;
  const WebcamBackgroundImg = `${BASE_NAME}/resources/images/webcam_background.svg`;
  const darkThemeState = AppService.isDarkThemeEnabled();

  return (
    <Styled.VideoPreviewModal
      onRequestClose={handleProceed}
      contentLabel={intl.formatMessage(intlMessages.webcamSettingsTitle)}
      shouldShowCloseButton={allowCloseModal}
      shouldCloseOnOverlayClick={allowCloseModal}
      isPhone={deviceInfo.isPhone}
      data-test="webcamSettingsModal"
      {...{ isOpen, priority }}
    >
      <Styled.Container>
        <Styled.Header>
          <Styled.WebcamTabs onSelect={setSelectedTab} selectedIndex={selectedTab}>
            <Styled.WebcamTabList>
              <Styled.WebcamTabSelector selectedClassName="is-selected">
                <Styled.IconSvg src={WebcamSettingsImg} darkThemeState={darkThemeState} />
                <span id="webcam-settings-title">{getModalTitle()}</span>
              </Styled.WebcamTabSelector>
              {shouldShowVirtualBackgroundsTab && (
                <>
                  <Styled.HeaderSeparator />
                  <Styled.WebcamTabSelector selectedClassName="is-selected">
                    <Styled.IconSvg src={WebcamBackgroundImg} darkThemeState={darkThemeState} />
                    <span id="backgrounds-title">{intl.formatMessage(intlMessages.webcamVirtualBackgroundTitle)}</span>
                  </Styled.WebcamTabSelector>
                </>
              )}
            </Styled.WebcamTabList>
          </Styled.WebcamTabs>
        </Styled.Header>
        {deviceInfo.hasMediaDevices ? renderModalContent() : supportWarning()}
      </Styled.Container>
    </Styled.VideoPreviewModal>
  );
};

export default VideoPreview;
