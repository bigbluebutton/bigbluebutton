import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuItem from '@mui/material/MenuItem';
import Styled from '/imports/ui/components/profile-settings/styles';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import VirtualBgSelector from '/imports/ui/components/video-preview/virtual-background/component';
import { CameraProfileProps, CustomBgParams, WebcamDevice } from '/imports/ui/components/video-preview/hooks/types';
import { isVirtualBackgroundSupported } from '/imports/ui/services/virtual-background/service';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';

const intlMessages: { [key: string]: { id: string; description?: string } } = defineMessages({
  cameraLabel: {
    id: 'app.videoPreview.cameraLabel',
    description: 'Camera dropdown label',
  },
  webcamNotFoundLabel: {
    id: 'app.videoPreview.webcamNotFoundLabel',
    description: 'Webcam not found label',
  },
  qualityLabel: {
    id: 'app.videoPreview.profileLabel',
    description: 'Quality dropdown label',
  },
  profileNotFoundLabel: {
    id: 'app.videoPreview.profileNotFoundLabel',
    description: 'Profile not found label',
  },
  brightnessLabel: {
    id: 'app.videoPreview.brightness',
    description: 'Brightness label',
  },
  brightnessDesc: {
    id: 'app.videoPreview.sliderDesc',
    description: 'Brightness slider aria description',
  },
  webcamVirtualBackgroundTitle: {
    id: 'app.videoPreview.webcamVirtualBackgroundLabel',
    description: 'Title for the virtual background section',
  },
  webcamVirtualBackgroundDisabledLabel: {
    id: 'app.videoPreview.webcamVirtualBackgroundDisabledLabel',
    description: 'Label for the virtual background toggle when not supported on this device',
  },
});

const BRIGHTNESS_DESC_ID = 'camera-brightness-desc';

interface CameraDeviceSelectorProps {
  devices: WebcamDevice[];
  value: string;
  onChange: (deviceId: string) => void;
  disabled?: boolean;
  dataTest?: string;
}

export const CameraDeviceSelector: React.FC<CameraDeviceSelectorProps> = ({
  devices,
  value,
  onChange,
  disabled = false,
  dataTest,
}) => {
  const { formatMessage } = useIntl();

  if (!devices || devices.length === 0) {
    return <span>{formatMessage(intlMessages.webcamNotFoundLabel)}</span>;
  }

  return (
    <Styled.DeviceSelector
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      IconComponent={ExpandMoreIcon}
      disabled={disabled}
      inputProps={{ 'aria-label': formatMessage(intlMessages.cameraLabel) }}
      data-test={dataTest}
    >
      {devices.map((webcam, index) => (
        <MenuItem key={webcam.deviceId} value={webcam.deviceId}>
          {webcam.label || `${formatMessage(intlMessages.cameraLabel)} ${index + 1}`}
        </MenuItem>
      ))}
    </Styled.DeviceSelector>
  );
};

interface CameraBrightnessInputProps {
  // 0-200, as stored by the preview hook; the slider itself is centred on 0.
  brightness: number;
  onChange: (brightness: number) => void;
  disabled?: boolean;
}

export const CameraBrightnessInput: React.FC<CameraBrightnessInputProps> = ({
  brightness,
  onChange,
  disabled = false,
}) => {
  const { formatMessage } = useIntl();
  const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;

  if (!ENABLE_CAMERA_BRIGHTNESS) return null;

  return (
    <>
      <Styled.BrightnessSlider
        sx={{ color: colorPrimary }}
        value={brightness - 100}
        defaultValue={0}
        min={-100}
        max={100}
        onChange={(_, value) => onChange((value as number) + 100)}
        aria-label={formatMessage(intlMessages.brightnessLabel)}
        // MUI puts aria-label on the range input but aria-describedby on the
        // root, so the description has to be routed to the input explicitly.
        slotProps={{ input: { 'aria-describedby': BRIGHTNESS_DESC_ID } }}
        valueLabelDisplay="auto"
        disabled={disabled || !isVirtualBackgroundSupported()}
      />
      <div style={{ display: 'none' }} id={BRIGHTNESS_DESC_ID}>
        {formatMessage(intlMessages.brightnessDesc)}
      </div>
    </>
  );
};

interface CameraQualitySelectorProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  // Wraps the selector when set, explaining why it is disabled.
  tooltip?: string;
  dataTest?: string;
}

export const CameraQualitySelector: React.FC<CameraQualitySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  tooltip,
  dataTest,
}) => {
  const { formatMessage } = useIntl();
  const CAMERA_PROFILES = (window.meetingClientSettings.public.kurento.cameraProfiles
    || []) as unknown as CameraProfileProps[];
  const profiles = CAMERA_PROFILES.filter((p) => !p.hidden);

  const selector = (
    <Styled.CameraQualitySelector
      value={value}
      onChange={(e) => onChange(e as unknown as React.ChangeEvent<HTMLSelectElement>)}
      IconComponent={ExpandMoreIcon}
      disabled={disabled}
      inputProps={{ 'aria-label': formatMessage(intlMessages.qualityLabel) }}
      data-test={dataTest}
    >
      {profiles.map((profile) => (
        <MenuItem key={profile.id} value={profile.id}>
          {intlMessages[`${profile.id}`] ? formatMessage(intlMessages[`${profile.id}`]) : profile.name}
        </MenuItem>
      ))}
    </Styled.CameraQualitySelector>
  );

  const renderSelector = () => {
    if (profiles.length === 0) {
      return <span>{formatMessage(intlMessages.profileNotFoundLabel)}</span>;
    }
    return tooltip ? <Tooltip title={tooltip}>{selector}</Tooltip> : selector;
  };

  return (
    <Styled.CameraQualityContainer>
      <Styled.CameraQualityText>{formatMessage(intlMessages.qualityLabel)}</Styled.CameraQualityText>
      {renderSelector()}
    </Styled.CameraQualityContainer>
  );
};

interface CameraVirtualBackgroundProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onSelected: (type: string, name: string, customParams?: CustomBgParams) => void;
  initialState: { type: string; name: string };
  isCustomVirtualBackgroundsEnabled: boolean;
  locked?: boolean;
  disabled?: boolean;
  hideNotificationToasts?: boolean;
}

export const CameraVirtualBackground: React.FC<CameraVirtualBackgroundProps> = ({
  checked,
  onCheckedChange,
  onSelected,
  initialState,
  isCustomVirtualBackgroundsEnabled,
  locked = false,
  disabled = false,
  hideNotificationToasts = false,
}) => {
  const { formatMessage } = useIntl();
  const showThumbnails = window.meetingClientSettings.public.virtualBackgrounds?.showThumbnails ?? true;
  const supported = isVirtualBackgroundSupported();

  const switchTitle = (
    <Styled.SwitchTitle
      sx={{ margin: 0 }}
      control={(
        <Styled.MaterialSwitch
          sx={{ marginRight: '1rem' }}
          checked={checked}
          onChange={(_, isChecked) => onCheckedChange(isChecked)}
          disabled={disabled || !supported}
          inputProps={{ 'data-test': 'virtualBackgroundToggle' } as React.InputHTMLAttributes<HTMLInputElement>}
        />
      )}
      label={formatMessage(intlMessages.webcamVirtualBackgroundTitle)}
    />
  );

  return (
    <>
      {supported
        ? switchTitle
        : (
          <Tooltip title={formatMessage(intlMessages.webcamVirtualBackgroundDisabledLabel)}>
            {switchTitle}
          </Tooltip>
        )}
      {checked && (
        <Styled.VirtualBgSelectorBorder>
          <VirtualBgSelector
            handleVirtualBgSelected={onSelected}
            locked={locked}
            showThumbnails={showThumbnails}
            initialVirtualBgState={initialState}
            isCustomVirtualBackgroundsEnabled={isCustomVirtualBackgroundsEnabled}
            renderSettingsLabel={false}
            hideNotificationToasts={hideNotificationToasts}
          />
        </Styled.VirtualBgSelectorBorder>
      )}
    </>
  );
};
