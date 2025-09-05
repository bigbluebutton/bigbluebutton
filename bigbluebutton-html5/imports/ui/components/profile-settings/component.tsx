import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuItem from '@mui/material/MenuItem';
import { Layout } from '../layout/layoutTypes';
import Styled from './styles';
import { layoutDispatch, layoutSelect } from '../layout/context';
import { ACTIONS, PANELS } from '../layout/enums';
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
  getSessionVirtualBackgroundInfoWithDefault,
} from '/imports/ui/services/virtual-background/service';
import { useSharedDevices, useIsUserLocked } from '/imports/ui/components/video-provider/hooks';
import { useIsCustomVirtualBackgroundsEnabled, useIsVirtualBackgroundsEnabled } from '../../services/features';
import VirtualBgSelector from '/imports/ui/components/video-preview/virtual-background/component';
import AudioSelectors from './audio-selectors/component';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import { colorPrimary } from '../../stylesheets/styled-components/palette';
import { useVideoPreview } from '/imports/ui/components/video-preview/hooks/useVideoPreview';
import { CameraProfileProps } from '/imports/ui/components/video-preview/hooks/types';

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
});

interface ProfileSettingsProps {
}
const ProfileSettings: React.FC<ProfileSettingsProps> = () => {
  const { formatMessage } = useIntl();
  const sharedDevices = useSharedDevices();
  const isCamLocked = useIsUserLocked();
  const isVirtualBackgroundsEnabled = useIsVirtualBackgroundsEnabled();
  const isCustomVirtualBackgroundsEnabled = useIsCustomVirtualBackgroundsEnabled();

  // @ts-ignore
  const settingsStorage = window.meetingClientSettings.public.app.userSettingsStorage;
  const initialWebcamDeviceId = useStorageKey('WebcamDeviceId', settingsStorage) as string || null;
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);

  const [virtualBackgroundChecked, setVirtualBackgroundChecked] = React.useState(false);

  const isAlreadyShared = (webcamId: string | null) => !!webcamId && sharedDevices.includes(webcamId);

  const {
    webcamDeviceId,
    virtualBackgroundActive,
    availableWebcams,
    selectedProfile,
    viewState,
    deviceError,
    previewError,
    brightness,
    isCameraLoading,
    videoRef,
    currentVideoStream,
    VIEW_STATES,
    handleSelectWebcam,
    handleSelectProfile,
    handleVirtualBgSelected,
    setCameraBrightness,
    stopVirtualBackground,
    updateVirtualBackgroundInfo,
    cleanupStreamAndVideo,
  } = useVideoPreview({
    initialDeviceId: initialWebcamDeviceId,
    initialProfileId: PreviewService.getDefaultProfile().id,
    isCameraShared: isAlreadyShared(initialWebcamDeviceId),
  });

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

  const handleToggleAFK = () => {
    muteAway(muted, away, voiceToggle);
    setAway({
      variables: {
        away: !away,
      },
    });
  };

  const handleVirtualBgChange = (checked: boolean) => {
    setVirtualBackgroundChecked(checked);
    if (!checked) {
      handleVirtualBgSelected(EFFECT_TYPES.NONE_TYPE, 'None');
    }
  };

  // Unused for now, but will be used in the future when UI/UX for sharing
  // through the profile settings is implemented - prlanzarin
  // @ts-expect-error TS6133: Unused variable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStartSharing = async () => {
    if (!currentVideoStream.current) return;
    if (
      !PreviewService.storeStream(webcamDeviceId, currentVideoStream.current)
    ) {
      currentVideoStream.current.stop();
    }

    if (
      currentVideoStream.current.virtualBgService
      && brightness === 100
      && currentVideoStream.current.virtualBgType === EFFECT_TYPES.NONE_TYPE
    ) {
      stopVirtualBackground(currentVideoStream.current);
    }

    PreviewService.changeProfile(selectedProfile);
    PreviewService.changeWebcam(webcamDeviceId);
    updateVirtualBackgroundInfo();
    cleanupStreamAndVideo();
    if (!isAlreadyShared(webcamDeviceId as string)) {
      VideoService.joinVideo(webcamDeviceId as string, isCamLocked);
    }
  };

  useEffect(() => {
    if (!virtualBackgroundChecked) {
      handleVirtualBgSelected(EFFECT_TYPES.NONE_TYPE, 'None');
    }
  }, [virtualBackgroundChecked]);

  useEffect(() => {
    if (virtualBackgroundActive && !virtualBackgroundChecked) {
      setVirtualBackgroundChecked(true);
    }
  }, [virtualBackgroundActive]);

  useEffect(() => {
    PreviewService.changeWebcam(webcamDeviceId);
  }, [webcamDeviceId]);

  useEffect(() => {
    PreviewService.changeProfile(selectedProfile);
  }, [selectedProfile]);

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
                    <div>{previewError}</div>
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
  }

  function renderQualitySelector(): React.ReactNode {
    // @ts-ignore
    const CAMERA_PROFILES = (window.meetingClientSettings.public.kurento.cameraProfiles || []) as CameraProfileProps[];
    // Filtered, without hidden profiles
    const PREVIEW_CAMERA_PROFILES = CAMERA_PROFILES.filter((p) => !p.hidden);

    const cameraSelector = (
      <Styled.CameraQualitySelector
        value={selectedProfile || ''}
        onChange={(e) => handleSelectProfile(e as unknown as React.ChangeEvent<HTMLSelectElement>)}
        IconComponent={ExpandMoreIcon}
        disabled={isAlreadyShared(webcamDeviceId as string)}
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
              {isAlreadyShared(webcamDeviceId as string) ? (
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

  const renderBrightnessInput = () => {
    // @ts-ignore
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    if (!ENABLE_CAMERA_BRIGHTNESS) return null;

    return (
      <Styled.BrightnessSlider
        sx={{ color: colorPrimary }}
        value={brightness - 100}
        defaultValue={0}
        min={-100}
        max={100}
        onChange={(_, value) => setCameraBrightness(value as number + 100)}
        aria-describedby="brightness-slider-desc"
        valueLabelDisplay="auto"
        disabled={!isVirtualBackgroundSupported() || isCameraLoading}
      />
    );
  };

  const renderVirtualBgSelector = (): JSX.Element => {
    const initialVirtualBgState = currentVideoStream.current
      ? {
        type: currentVideoStream.current.virtualBgType,
        name: currentVideoStream.current.virtualBgName,
        uniqueId: currentVideoStream.current.virtualBgUniqueId,
      }
      : getSessionVirtualBackgroundInfoWithDefault(webcamDeviceId);

    // @ts-ignore
    const SHOW_THUMBNAILS = window.meetingClientSettings.public.virtualBackgrounds?.showThumbnails ?? true;

    return (
      <>
        <Styled.SwitchTitle
          sx={{ margin: 0 }}
          control={(
            <Styled.MaterialSwitch
              sx={{ marginRight: '1rem' }}
              checked={virtualBackgroundChecked}
              onChange={(_, checked) => handleVirtualBgChange(checked)}
              disabled={!isVirtualBackgroundsEnabled || isCameraLoading}
            />
          )}
          label={formatMessage(intlMessages.webcamVirtualBackgroundTitle)}
        />
        {virtualBackgroundChecked
          && (
            <Styled.VirtualBgSelectorBorder>
              <VirtualBgSelector
                handleVirtualBgSelected={handleVirtualBgSelected}
                locked={isCameraLoading}
                showThumbnails={SHOW_THUMBNAILS}
                initialVirtualBgState={initialVirtualBgState}
                isCustomVirtualBackgroundsEnabled={isCustomVirtualBackgroundsEnabled}
                renderSettingsLabel={false}
              />
            </Styled.VirtualBgSelectorBorder>
          )}
      </>
    );
  };

  return (
    <>
      <Styled.HeaderContainer
        isRTL={isRTL}
        data-test="profileSettingsTitle"
        title={formatMessage(intlMessages.title)}
        leftButtonProps={{}}
        rightButtonProps={{
          'aria-label': formatMessage(intlMessages.minimize, { 0: formatMessage(intlMessages.title) }),
          'data-test': 'closeProfileSettings',
          icon: 'minus',
          label: formatMessage(intlMessages.minimize, { 0: formatMessage(intlMessages.title) }),
          onClick: () => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
          },
        }}
        customRightButton={null}
      />
      <Styled.Separator />
      {renderWebcamPreview()}
      <Styled.ProfileSettings>
        <Styled.UsernameContainer>
          <Styled.UsernameTitle>{formatMessage(intlMessages.username)}</Styled.UsernameTitle>
          <Styled.Username>{currentUserData?.name ?? ''}</Styled.Username>
        </Styled.UsernameContainer>
        <Styled.UserPresenceRoot>
          <Styled.UserPresenceContainer>
            <Styled.UserPresenceButton active={!currentUserData?.away} onClick={handleToggleAFK}>
              <Styled.UserPresenceText>{formatMessage(intlMessages.availableLabel)}</Styled.UserPresenceText>
            </Styled.UserPresenceButton>
            <Styled.UserPresenceDivider />
            <Styled.UserPresenceButton active={currentUserData?.away} onClick={handleToggleAFK}>
              <Styled.UserPresenceText>{formatMessage(intlMessages.awayLabel)}</Styled.UserPresenceText>
            </Styled.UserPresenceButton>
          </Styled.UserPresenceContainer>
        </Styled.UserPresenceRoot>
        <Styled.Separator />
        <Styled.DevicesSettingsContainer>
          <AudioSelectors inAudio={!!currentUserData?.voice} />
          <Styled.DeviceContainer>
            <Styled.IconCamera />
            {availableWebcams && availableWebcams.length > 0
              ? (
                <Styled.DeviceSelector
                  value={webcamDeviceId || ''}
                  onChange={(e) => handleSelectWebcam(e as unknown as React.ChangeEvent<HTMLSelectElement>)}
                  IconComponent={ExpandMoreIcon}
                >
                  {availableWebcams.map((webcam, index) => (
                    <MenuItem key={webcam.deviceId} value={webcam.deviceId}>
                      {webcam.label || `${formatMessage(intlMessages.cameraLabel)} ${index}`}
                    </MenuItem>
                  ))}
                </Styled.DeviceSelector>
              )
              : <span>{formatMessage(intlMessages.webcamNotFoundLabel)}</span>}
          </Styled.DeviceContainer>
          <Styled.DeviceContainer>
            <Styled.WbSunnyIcon />
            {renderBrightnessInput()}
          </Styled.DeviceContainer>
          {renderQualitySelector()}
        </Styled.DevicesSettingsContainer>
        <Styled.Separator />
        <Styled.VirtualBackgroundContainer>
          {isVirtualBackgroundsEnabled && renderVirtualBgSelector()}
        </Styled.VirtualBackgroundContainer>
      </Styled.ProfileSettings>
    </>
  );
};

export default ProfileSettings;
