import React, {
  useCallback, useEffect,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuItem from '@mui/material/MenuItem';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import Styled from './styles';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { PANELS } from '/imports/ui/components/layout/enums';
import { useStorageKey } from '../../services/storage/hooks';
import VideoService from '/imports/ui/components/video-provider/service';
import PreviewService from '/imports/ui/components/video-preview/service';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_AWAY } from '../user-list/user-list-participants/list-item/mutations';
import { muteAway } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import Auth from '/imports/ui/services/auth';
import {
  EFFECT_TYPES,
  isVirtualBackgroundSupported,
  getCameraBrightnessInfoWithDefault,
  getSessionVirtualBackgroundInfo,
} from '/imports/ui/services/virtual-background/service';
import {
  useSharedDevices, useIsCamSharingLocked, useStopVideo, useStreams,
} from '/imports/ui/components/video-provider/hooks';
import { useIsCustomVirtualBackgroundsEnabled, useIsVirtualBackgroundsEnabled } from '../../services/features';
import VirtualBgSelector from '/imports/ui/components/video-preview/virtual-background/component';
import AudioSelectors from './audio-selectors/component';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import { colorPrimary } from '../../stylesheets/styled-components/palette';
import { useVideoPreview } from '/imports/ui/components/video-preview/hooks/useVideoPreview';
import { CameraProfileProps, CustomBgParams } from '/imports/ui/components/video-preview/hooks/types';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import getFromUserSettings from '../../services/users-settings';
import PanelHeader from '/imports/ui/components/common/panel-header/component';

const intlMessages: { [key: string]: { id: string; description?: string } } = defineMessages({
  title: {
    id: 'app.profileSettings.title',
    description: 'Label for the profile settings panel title',
  },
  minimize: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Minimize button label',
  },
  username: {
    id: 'app.profileSettings.usernameTitle',
    description: 'Label for the username title in profile settings',
  },
  webcamVirtualBackgroundTitle: {
    id: 'app.videoPreview.webcamVirtualBackgroundLabel',
    description: 'Title for the virtual background modal',
  },
  cameraLabel: {
    id: 'app.videoPreview.cameraLabel',
    description: 'Camera dropdown label',
  },
  qualityLabel: {
    id: 'app.videoPreview.profileLabel',
    description: 'Quality dropdown label',
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
  awayLabel: {
    id: 'app.actionsBar.reactions.away',
    description: 'Away Label',
  },
  availableLabel: {
    id: 'app.actionsBar.reactions.available',
    description: 'Available Label',
  },
  statusLabel: {
    id: 'app.profileSettings.statusTitle',
    description: 'Label for the status section in profile settings',
  },
  joinVideoLabel: {
    id: 'app.video.joinVideo',
    description: 'Join Video Label',
  },
  stopSharingLabel: {
    id: 'app.videoPreview.stopSharingLabel',
    description: 'Stop Sharing Label',
  },
  addExtraCameraLabel: {
    id: 'app.profileSettings.addExtraCamera',
    description: 'Add Extra Camera Button Label',
  },
});

interface CameraSection {
  deviceId: string | null;
  brightness: number;
  virtualBackgroundChecked: boolean;
  virtualBackground: {
    type: string;
    name: string;
    uniqueId?: string | null;
  };
}

const createCameraSection = (deviceId: string | null): CameraSection => {
  const vbgInfo = deviceId ? getSessionVirtualBackgroundInfo(deviceId) : null;
  const brightnessInfo = deviceId
    ? getCameraBrightnessInfoWithDefault(deviceId)
    : { brightness: 100 };

  return {
    deviceId,
    brightness: brightnessInfo.brightness,
    virtualBackgroundChecked: vbgInfo ? vbgInfo.type !== EFFECT_TYPES.NONE_TYPE : false,
    virtualBackground: vbgInfo || { type: EFFECT_TYPES.NONE_TYPE, name: 'None' },
  };
};

const updateCameraSections = (
  prevSections: CameraSection[],
  sharedDevices: string[],
  prevSharedDevices: string[] | undefined,
  lastUsedWebcamDeviceId: string | null,
  stoppedDeviceIds: string[],
  newlySharedDeviceIds: string[],
): CameraSection[] => {
  let newSections: CameraSection[];

  if (prevSharedDevices === undefined) {
    // On first load, initialize with shared devices or default
    if (sharedDevices.length > 0) {
      newSections = sharedDevices.map(createCameraSection);
    } else {
      newSections = [createCameraSection(lastUsedWebcamDeviceId)];
    }
  } else {
    // Handle device changes
    let currentSections = [...prevSections];
    // Handle stopped devices
    if (stoppedDeviceIds.length > 0) {
      currentSections = currentSections.filter((s) => !s.deviceId
        || !stoppedDeviceIds.includes(s.deviceId));
    }

    // Handle newly shared devices
    newlySharedDeviceIds.forEach((deviceId) => {
      if (!currentSections.some((s) => s.deviceId === deviceId)) {
        currentSections.push(createCameraSection(deviceId));
      }
    });
    newSections = currentSections;
  }

  // If all sections were removed, add default
  if (newSections.length === 0) {
    newSections.push(createCameraSection(lastUsedWebcamDeviceId));
  }

  // Deduplicate and sort sections
  let finalSections = Array.from(new Map(newSections.map((s) => [s.deviceId, s])).values());

  // if there is a shared camera, the first section should always be that camera
  if (sharedDevices.length > 0) {
    const sharedSections = finalSections.filter((s) => sharedDevices.includes(s.deviceId as string));
    const unsharedSections = finalSections.filter((s) => !sharedDevices.includes(s.deviceId as string));
    finalSections = [...sharedSections, ...unsharedSections];
  }

  if (JSON.stringify(finalSections) === JSON.stringify(prevSections)) {
    return prevSections;
  }

  return finalSections;
};

interface ProfileSettingsProps {
}
const ProfileSettings: React.FC<ProfileSettingsProps> = () => {
  const { formatMessage } = useIntl();
  const sharedDevices = useSharedDevices();
  const isCamLocked = useIsCamSharingLocked();
  const stopVideo = useStopVideo();
  const streams = useStreams();
  const isVirtualBackgroundsEnabled = useIsVirtualBackgroundsEnabled();
  const isCustomVirtualBackgroundsEnabled = useIsCustomVirtualBackgroundsEnabled();

  // @ts-ignore
  const settingsStorage = window.meetingClientSettings.public.app.userSettingsStorage;
  const lastUsedWebcamDeviceId = useStorageKey('WebcamDeviceId', settingsStorage) as string || null;

  const [cameraSections, setCameraSections] = React.useState<CameraSection[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = React.useState(0);
  const prevSharedDevices = usePreviousValue(sharedDevices);
  const { hideNotificationToasts } = layoutSelectInput((i: Input) => i.notificationsBar);
  const hideNotifications = hideNotificationToasts || getFromUserSettings('bbb_hide_notifications', false);

  const isAlreadyShared = useCallback((webcamId: string | null) => {
    return !!webcamId && sharedDevices.includes(webcamId);
  }, [sharedDevices]);

  const initialWebcamDeviceId = (sharedDevices && sharedDevices.length > 0)
    ? sharedDevices[0]
    : lastUsedWebcamDeviceId;

  const {
    webcamDeviceId,
    virtualBackgroundActive,
    availableWebcams,
    selectedProfile,
    viewState,
    deviceError,
    previewError,
    isCameraLoading,
    videoRef,
    currentVideoStream,
    VIEW_STATES,
    handleSelectWebcam,
    handleSelectProfile,
    handleVirtualBgSelected,
    setCameraBrightness,
    stopVirtualBackground,
    applyStoredVirtualBg,
  } = useVideoPreview({
    initialDeviceId: initialWebcamDeviceId,
    initialProfileId: PreviewService.getDefaultProfile().id,
    isCameraShared: isAlreadyShared(initialWebcamDeviceId),
    forceOpen: true,
  });

  const prevWebcamDeviceId = usePreviousValue(webcamDeviceId);

  useEffect(() => {
    // fill section deviceId if empty or if only one section exists and it's different than current webcam
    if (webcamDeviceId) {
      if (!prevWebcamDeviceId) {
        const emptySectionIndex = cameraSections.findIndex((s) => !s.deviceId);
        if (emptySectionIndex !== -1) {
          setCameraSections((prevSections) => {
            const newSections = [...prevSections];
            newSections[emptySectionIndex].deviceId = webcamDeviceId;
            return newSections;
          });
          return;
        }
      }

      if (cameraSections.length === 1 && cameraSections[0].deviceId !== webcamDeviceId) {
        setCameraSections((prevSections) => {
          const newSections = [...prevSections];
          newSections[0].deviceId = webcamDeviceId;
          return newSections;
        });
      }
    }
  }, [webcamDeviceId, cameraSections]);

  useEffect(() => {
    const pSharedDevices = prevSharedDevices || [];
    const stoppedDeviceIds = pSharedDevices.filter((d: string) => !sharedDevices.includes(d));
    const newlySharedDeviceIds = sharedDevices.filter((d: string) => !pSharedDevices.includes(d));

    // No changes in shared devices, do nothing after initial load.
    if (
      stoppedDeviceIds.length === 0
      && newlySharedDeviceIds.length === 0
      && prevSharedDevices !== undefined
    ) {
      return;
    }

    setCameraSections((prevSections) => {
      const newSections = updateCameraSections(
        prevSections,
        sharedDevices,
        prevSharedDevices,
        lastUsedWebcamDeviceId,
        stoppedDeviceIds,
        newlySharedDeviceIds,
      );

      // update activeIndex if needed
      if (activePreviewIndex >= newSections.length) {
        const newActiveIndex = newSections.findIndex((s) => s.deviceId === webcamDeviceId);
        setActivePreviewIndex(newActiveIndex > -1 ? newActiveIndex : 0);
      }

      return newSections;
    });
  }, [sharedDevices, lastUsedWebcamDeviceId, activePreviewIndex, webcamDeviceId]);

  // Sync the active preview section with the current webcam device.
  useEffect(() => {
    const newActiveIndex = cameraSections.findIndex((s) => s.deviceId === webcamDeviceId);
    if (newActiveIndex !== -1 && newActiveIndex !== activePreviewIndex) {
      setActivePreviewIndex(newActiveIndex);
    }
  }, [webcamDeviceId, cameraSections]);

  const { data: currentUserData } = useCurrentUser((user) => ({
    name: user.name,
    away: user.away,
    inAudio: user.voice,
  }));

  const voiceToggle = useToggleVoice();
  const { data: unmutedUsers } = useWhoIsUnmuted();

  const muted = !unmutedUsers[Auth.userID as string];
  const away = currentUserData?.away ?? false;

  const [setAway] = useMutation(SET_AWAY);

  const handleSetStatus = useCallback((status: string) => {
    const isAway = status === 'away';

    if (isAway === away) return;

    muteAway(muted, away, voiceToggle);
    setAway({
      variables: {
        away: isAway,
      },
    });
  }, [muted, away, voiceToggle, setAway]);

  const handleAddCamera = useCallback(() => {
    const usedDeviceIds = cameraSections.map((s) => s.deviceId);
    const nextAvailableDevice = availableWebcams.find((d) => !usedDeviceIds.includes(d.deviceId));
    if (nextAvailableDevice) {
      const vbgInfo = getSessionVirtualBackgroundInfo(nextAvailableDevice.deviceId);
      const brightnessInfo = getCameraBrightnessInfoWithDefault(nextAvailableDevice.deviceId);
      setCameraSections((prev) => [...prev, {
        deviceId: nextAvailableDevice.deviceId,
        brightness: brightnessInfo.brightness,
        virtualBackgroundChecked: vbgInfo ? vbgInfo.type !== EFFECT_TYPES.NONE_TYPE : false,
        virtualBackground: vbgInfo || { type: EFFECT_TYPES.NONE_TYPE, name: 'None' },
      }]);
      setPreviewToIndex(cameraSections.length, nextAvailableDevice.deviceId);
    }
  }, [cameraSections, availableWebcams]);

  // switch the preview to the given index and deviceId
  const setPreviewToIndex = useCallback(async (index: number, newDeviceId: string) => {
    if (index !== activePreviewIndex) {
      setActivePreviewIndex(index);
    }
    if (newDeviceId !== webcamDeviceId) {
      const fakeEvent = { target: { value: newDeviceId } } as unknown as React.ChangeEvent<HTMLSelectElement>;
      await handleSelectWebcam(fakeEvent);
      // only set brightness if camera is not shared
      if (!isAlreadyShared(newDeviceId) && cameraSections[index]) {
        setCameraBrightness(cameraSections[index].brightness, newDeviceId);
      }
    }
  }, [cameraSections, activePreviewIndex, webcamDeviceId, handleSelectWebcam, setCameraBrightness]);

  const handleCameraSectionChange = useCallback((index: number, newDeviceId: string) => {
    const newSections = [...cameraSections];
    newSections[index].deviceId = newDeviceId;
    setCameraSections(newSections);
    setPreviewToIndex(index, newDeviceId);
  }, [cameraSections, setPreviewToIndex]);

  const handleBrightnessChange = useCallback((index: number, value: number) => {
    const newSections = [...cameraSections];
    newSections[index].brightness = value;

    setPreviewToIndex(index, newSections[index].deviceId as string).then(() => {
      setCameraBrightness(value, newSections[index].deviceId);
      setCameraSections(newSections);
    });
  }, [cameraSections, setPreviewToIndex, setCameraBrightness]);

  const handleVirtualBgChange = useCallback((index: number, checked: boolean) => {
    const newSections = [...cameraSections];
    newSections[index].virtualBackgroundChecked = checked;
    setCameraSections(newSections);

    setPreviewToIndex(index, newSections[index].deviceId as string).then(() => {
      if (!checked) {
        stopVirtualBackground(currentVideoStream.current);
      } else {
        applyStoredVirtualBg(newSections[index].deviceId);
      }
    });
  }, [cameraSections, setPreviewToIndex, stopVirtualBackground, currentVideoStream, applyStoredVirtualBg]);

  const handleVirtualBgSelectedForSection = useCallback((
    index: number, type: string, name: string, customParams?: CustomBgParams,
  ) => {
    const newSections = [...cameraSections];
    const section = newSections[index];
    section.virtualBackground = { type, name, ...customParams };
    setCameraSections(newSections);

    return setPreviewToIndex(index, section.deviceId as string).then(async () => {
      handleVirtualBgSelected(type, name, customParams, section?.deviceId);
    });
  }, [cameraSections, setPreviewToIndex, handleVirtualBgSelected]);

  const handleShareWebcams = useCallback(() => {
    const activeSection = cameraSections[activePreviewIndex];

    if (currentVideoStream.current && activeSection.deviceId) {
      const { type } = activeSection.virtualBackground;

      PreviewService.changeWebcam(activeSection.deviceId);
      PreviewService.changeProfile(selectedProfile);

      if (
        currentVideoStream.current.virtualBgService
      && activeSection.brightness === 100
      && type === EFFECT_TYPES.NONE_TYPE
      ) {
        stopVirtualBackground(currentVideoStream.current);
      }

      // Store the stream so VideoService can find it.
      PreviewService.storeStream(activeSection.deviceId, currentVideoStream.current);
      // Share the video.
      VideoService.joinVideo(activeSection.deviceId, isCamLocked);
    }
  }, [
    cameraSections,
    activePreviewIndex,
    currentVideoStream.current,
    selectedProfile,
    isCamLocked,
    stopVirtualBackground,
  ]);

  const handleStopSharing = useCallback(async (sectionIndex: number, deviceId: string | null) => {
    if (!deviceId) return;

    const streamId = VideoService.getMyStreamId(deviceId, streams);
    if (streamId) stopVideo(streamId);

    if (cameraSections.length > 1) {
      const newSections = cameraSections.filter((_, i) => i !== sectionIndex);
      setCameraSections(newSections);

      // If the active preview was removed, switch to the first available section
      if (activePreviewIndex === sectionIndex) {
        const newActiveIndex = 0;
        setActivePreviewIndex(newActiveIndex);
        const newDeviceId = newSections[newActiveIndex]?.deviceId;
        if (newDeviceId) {
          const fakeEvent = { target: { value: newDeviceId } } as unknown as React.ChangeEvent<HTMLSelectElement>;
          await handleSelectWebcam(fakeEvent);
        }
      } else if (activePreviewIndex > sectionIndex) {
        // If an earlier section was removed, decrement the active index to keep pointing to the same camera.
        setActivePreviewIndex((prev) => prev - 1);
      }
    }
  }, [streams, stopVideo, cameraSections, activePreviewIndex, handleSelectWebcam]);

  useEffect(() => {
    const activeSection = cameraSections[activePreviewIndex];
    if (activeSection && virtualBackgroundActive !== activeSection.virtualBackgroundChecked) {
      const newSections = [...cameraSections];
      newSections[activePreviewIndex].virtualBackgroundChecked = virtualBackgroundActive;
      if (virtualBackgroundActive) {
        newSections[activePreviewIndex].virtualBackground = {
          type: currentVideoStream.current?.virtualBgType || EFFECT_TYPES.BLUR_TYPE,
          name: currentVideoStream.current?.virtualBgName || 'Blur',
          uniqueId: currentVideoStream.current?.virtualBgUniqueId,
        };
      }
      setCameraSections(newSections);
    }
  }, [virtualBackgroundActive]);

  // restart preview if the current camera is stopped
  useEffect(() => {
    const pSharedDevices = prevSharedDevices || [];
    const stoppedDeviceIds = pSharedDevices.filter((d) => !sharedDevices.includes(d));

    if (webcamDeviceId && stoppedDeviceIds.includes(webcamDeviceId)) {
      // The current preview device was stopped externally.
      // Switch to another available device if possible.
      const nextSharedDevice = sharedDevices.find((d) => d !== webcamDeviceId);
      if (nextSharedDevice) {
        const newIndex = cameraSections.findIndex((s) => s.deviceId === nextSharedDevice);
        if (newIndex !== -1) {
          setPreviewToIndex(newIndex, nextSharedDevice);
          return;
        }
      }

      // If no other shared device is available, restart the current preview.
      // This is useful when the user stops the only shared camera.
      // wait a bit before restarting
      setTimeout(() => {
        const fakeEvent = { target: { value: webcamDeviceId } } as unknown as React.ChangeEvent<HTMLSelectElement>;
        handleSelectWebcam(fakeEvent);
      }, 500);
    }
  }, [sharedDevices, webcamDeviceId, cameraSections, handleSelectWebcam]);

  const changePreview = useCallback((direction: number) => {
    const newIndex = (activePreviewIndex + direction + cameraSections.length) % cameraSections.length;
    setPreviewToIndex(newIndex, cameraSections[newIndex].deviceId as string);
  }, [activePreviewIndex, cameraSections, webcamDeviceId]);

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

    const activeSection = cameraSections[activePreviewIndex];

    if (!activeSection) return null;

    const currentDevice = availableWebcams.find((d) => d.deviceId === activeSection.deviceId);
    const cameraName = currentDevice?.label || `${formatMessage(intlMessages.cameraLabel)} ${activePreviewIndex + 1}`;

    return (
      <Styled.VideoPreviewContainer>
        <Styled.VideoPreviewWrapper>
          {(() => {
            switch (viewState) {
              case VIEW_STATES.finding:
                return (
                  <Styled.VideoPreviewContent>
                    <Styled.VideoCol>
                      <div style={containerStyle}>
                        <span>{formatMessage(intlMessages.findingWebcamsLabel)}</span>
                        <Styled.FetchingAnimation animations={animations} />
                      </div>
                    </Styled.VideoCol>
                  </Styled.VideoPreviewContent>
                );
              case VIEW_STATES.error:
                return (
                  <Styled.VideoPreviewContent>
                    <Styled.VideoCol><div>{deviceError}</div></Styled.VideoCol>
                  </Styled.VideoPreviewContent>
                );
              case VIEW_STATES.found:
              default:
                return (
                  <Styled.VideoPreviewContent>
                    <Styled.VideoCol>
                      {
                        previewError
                          ? (
                            <div style={containerStyle}>{previewError}</div>
                          )
                          : (
                            <Styled.VideoPreview
                              mirroredVideo={VideoService.mirrorOwnWebcam()}
                              id="preview"
                              data-test={VideoService.mirrorOwnWebcam() ? 'mirroredVideoPreview' : 'videoPreview'}
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                            />
                          )
                      }
                    </Styled.VideoCol>
                  </Styled.VideoPreviewContent>
                );
            }
          })()}
          {cameraSections.length > 1 && (
          <>
            <Styled.PreviewArrowButton
              aria-label="Previous camera"
              onClick={() => changePreview(-1)}
              position="left"
            >
              <Styled.ArrowLeftIcon />
            </Styled.PreviewArrowButton>
            <Styled.PreviewArrowButton
              aria-label="Next camera"
              onClick={() => changePreview(1)}
              position="right"
            >
              <Styled.ArrowRightIcon />
            </Styled.PreviewArrowButton>
            <Styled.CameraNameLabel>
              {cameraName}
            </Styled.CameraNameLabel>
          </>
          )}
        </Styled.VideoPreviewWrapper>
      </Styled.VideoPreviewContainer>
    );
  }

  function renderQualitySelector(sectionIndex: number): React.ReactNode {
    // @ts-ignore
    const CAMERA_PROFILES = (window.meetingClientSettings.public.kurento.cameraProfiles || []) as CameraProfileProps[];
    // Filtered, without hidden profiles
    const PREVIEW_CAMERA_PROFILES = CAMERA_PROFILES.filter((p) => !p.hidden);

    const cameraSelector = (
      <Styled.CameraQualitySelector
        value={selectedProfile || ''}
        onChange={(e) => handleSelectProfile(e as unknown as React.ChangeEvent<HTMLSelectElement>)}
        IconComponent={ExpandMoreIcon}
        disabled={isAlreadyShared(cameraSections[sectionIndex].deviceId as string)}
      >
        {PREVIEW_CAMERA_PROFILES.map((profile: CameraProfileProps) => {
          const label = intlMessages[`${profile.id}`]
            ? formatMessage(intlMessages[`${profile.id}`])
            : profile.name;
          return (
            <MenuItem key={profile.id} value={profile.id}>
              {label}
            </MenuItem>
          );
        })}
      </Styled.CameraQualitySelector>
    );

    return (
      <Styled.CameraQualityContainer>
        <Styled.CameraQualityText>
          {formatMessage(intlMessages.qualityLabel)}
        </Styled.CameraQualityText>
        {PREVIEW_CAMERA_PROFILES.length > 0
          ? (
            <>
              {isAlreadyShared(cameraSections[sectionIndex].deviceId as string) ? (
                <Tooltip title={formatMessage(intlMessages.sharedCameraLabel)}>
                  {cameraSelector}
                </Tooltip>
              ) : (
                cameraSelector
              )}
            </>
          )
          : (
            <span>
              {formatMessage(intlMessages.profileNotFoundLabel)}
            </span>
          )}
      </Styled.CameraQualityContainer>
    );
  }

  const renderBrightnessInput = (sectionIndex: number, currentBrightness: number) => {
    // @ts-ignore
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    if (!ENABLE_CAMERA_BRIGHTNESS) return null;

    return (
      <Styled.BrightnessSlider
        sx={{ color: colorPrimary }}
        value={currentBrightness - 100}
        defaultValue={0}
        min={-100}
        max={100}
        onChange={(_, value) => handleBrightnessChange(sectionIndex, value as number + 100)}
        aria-describedby="brightness-slider-desc"
        valueLabelDisplay="auto"
        disabled={!isVirtualBackgroundSupported() || isCameraLoading}
      />
    );
  };

  const renderVirtualBgSelector = (sectionIndex: number): JSX.Element => {
    const section = cameraSections[sectionIndex];
    const initialVirtualBgState = section.virtualBackground;

    // @ts-ignore
    const SHOW_THUMBNAILS = window.meetingClientSettings.public.virtualBackgrounds?.showThumbnails ?? true;

    const onVirtualBgSelected = (
      type: string,
      name: string,
      customParams: CustomBgParams,
    ) => handleVirtualBgSelectedForSection(
      sectionIndex, type, name, customParams,
    );

    return (
      <>
        <Styled.SwitchTitle
          sx={{ margin: 0 }}
          control={(
            <Styled.MaterialSwitch
              sx={{ marginRight: '1rem' }}
              checked={section.virtualBackgroundChecked}
              onChange={(_, checked) => handleVirtualBgChange(sectionIndex, checked)}
              disabled={!isVirtualBackgroundsEnabled || isCameraLoading}
            />
          )}
          label={formatMessage(intlMessages.webcamVirtualBackgroundTitle)}
        />
        {section.virtualBackgroundChecked
          && (
            <Styled.VirtualBgSelectorBorder>
              <VirtualBgSelector
                handleVirtualBgSelected={onVirtualBgSelected}
                locked={isCameraLoading}
                showThumbnails={SHOW_THUMBNAILS}
                initialVirtualBgState={initialVirtualBgState}
                isCustomVirtualBackgroundsEnabled={isCustomVirtualBackgroundsEnabled}
                renderSettingsLabel={false}
                hideNotificationToasts={hideNotifications}
              />
            </Styled.VirtualBgSelectorBorder>
          )}
      </>
    );
  };

  const isCameraAlreadyShared = cameraSections[activePreviewIndex]
    && cameraSections[activePreviewIndex].deviceId
    && isAlreadyShared(cameraSections[activePreviewIndex].deviceId as string);

  return (
    <Styled.RootContainer>
      <PanelHeader
        panelId={PANELS.PROFILE}
        title={formatMessage(intlMessages.title)}
        dataTest="profileSettingsTitle"
        closeButtonDataTest="closeProfileSettings"
      />
      <Styled.Separator />
      {renderWebcamPreview()}
      <Styled.ProfileSettings>
        <Styled.UsernameContainer>
          <Styled.UsernameTitle>{formatMessage(intlMessages.username)}</Styled.UsernameTitle>
          <Styled.Username>{currentUserData?.name ?? ''}</Styled.Username>
        </Styled.UsernameContainer>
        <Styled.UserPresenceRoot>
          <Styled.UsernameTitle id="status-label-id">{formatMessage(intlMessages.statusLabel)}</Styled.UsernameTitle>
          <Styled.UserPresenceField>
            <Styled.UserPresenceIndicator aria-hidden>
              <Styled.UserPresenceStatusDot away={away} />
            </Styled.UserPresenceIndicator>
            <Styled.UserPresenceDropdown
              labelId="status-label-id"
              value={away ? 'away' : 'available'}
              onChange={(e) => handleSetStatus(e.target.value as string)}
              IconComponent={ExpandMoreIcon}
              renderValue={(val) => (
                <Styled.UserPresenceText>
                  {val === 'away'
                    ? formatMessage(intlMessages.awayLabel)
                    : formatMessage(intlMessages.availableLabel)}
                </Styled.UserPresenceText>
              )}
            >
              <MenuItem value="available">
                <Styled.UserPresenceValueContainer>
                  <Styled.UserPresenceStatusDot away={false} />
                  <Styled.UserPresenceText>{formatMessage(intlMessages.availableLabel)}</Styled.UserPresenceText>
                </Styled.UserPresenceValueContainer>
              </MenuItem>
              <MenuItem value="away">
                <Styled.UserPresenceValueContainer>
                  <Styled.UserPresenceStatusDot away />
                  <Styled.UserPresenceText>{formatMessage(intlMessages.awayLabel)}</Styled.UserPresenceText>
                </Styled.UserPresenceValueContainer>
              </MenuItem>
            </Styled.UserPresenceDropdown>
          </Styled.UserPresenceField>
        </Styled.UserPresenceRoot>
        <Styled.Separator />
        <Styled.DevicesSettingsContainer>
          <AudioSelectors inAudio={!!currentUserData?.voice} />
        </Styled.DevicesSettingsContainer>
        <Styled.Separator />
        {cameraSections.map((section: CameraSection, sectionIndex) => {
          const usedDeviceIds = cameraSections
            .map((s) => s.deviceId)
            .filter((id) => id !== section.deviceId);
          const availableDevicesForSection = availableWebcams
            .filter((d) => !usedDeviceIds.includes(d.deviceId));

          return (
            <React.Fragment key={section.deviceId || `section-${sectionIndex}`}>
              <Styled.DevicesSettingsContainer>
                <Styled.DeviceContainer>
                  <Styled.IconCamera />
                  {availableWebcams && availableWebcams.length > 0
                    ? (
                      <Styled.DeviceSelector
                        value={!previewError ? section.deviceId || webcamDeviceId : ''}
                        onChange={(e) => handleCameraSectionChange(sectionIndex, e.target.value as string)}
                        IconComponent={ExpandMoreIcon}
                      >
                        {availableDevicesForSection.map((webcam, index) => (
                          <MenuItem key={webcam.deviceId} value={webcam.deviceId}>
                            {webcam.label || `${formatMessage(intlMessages.cameraLabel)} ${index + 1}`}
                          </MenuItem>
                        ))}
                      </Styled.DeviceSelector>
                    )
                    : <span>{formatMessage(intlMessages.webcamNotFoundLabel)}</span>}
                </Styled.DeviceContainer>
                <Styled.DeviceContainer extraPadding={cameraSections.length > 1}>
                  <Styled.WbSunnyIcon />
                  {renderBrightnessInput(sectionIndex, section.brightness)}
                </Styled.DeviceContainer>
                <Styled.DeviceContainer extraPadding={cameraSections.length > 1}>
                  {renderQualitySelector(sectionIndex)}
                </Styled.DeviceContainer>
              </Styled.DevicesSettingsContainer>
              <Styled.VirtualBackgroundContainer extraPadding={cameraSections.length > 1}>
                {isVirtualBackgroundsEnabled && renderVirtualBgSelector(sectionIndex)}
              </Styled.VirtualBackgroundContainer>
              {isAlreadyShared(section.deviceId) && (
                <Styled.StopSharingButtonText
                  extraPadding={cameraSections.length > 1}
                  onClick={() => handleStopSharing(sectionIndex, section.deviceId)}
                >
                  {formatMessage(intlMessages.stopSharingLabel)}
                </Styled.StopSharingButtonText>
              )}
              {sectionIndex < cameraSections.length - 1 && <Styled.Separator />}
            </React.Fragment>
          );
        })}
      </Styled.ProfileSettings>
      {availableWebcams && availableWebcams.length > 1 && (
      <>
        <Styled.Separator />
        <Styled.AddCameraContainer>
          <Styled.AddCameraButtonAndText
            onClick={handleAddCamera}
            disabled={cameraSections.length >= availableWebcams.length}
          >
            <Styled.AddCameraIcon />
            {formatMessage(intlMessages.addExtraCameraLabel)}
          </Styled.AddCameraButtonAndText>
        </Styled.AddCameraContainer>
      </>
      )}
      <Styled.Separator />
      <Styled.SaveButtonContainer>
        <Styled.SaveButton
          disabled={isCameraAlreadyShared || isCameraLoading || !!(deviceError || previewError)}
          color="primary"
          label={formatMessage(intlMessages.joinVideoLabel)}
          onClick={handleShareWebcams}
          data-test="saveProfileSettings"
        />
      </Styled.SaveButtonContainer>
    </Styled.RootContainer>
  );
};

export default ProfileSettings;
