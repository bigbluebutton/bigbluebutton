import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import useAudioDeviceLabel, { AUDIO_INPUT, AUDIO_OUTPUT } from '/imports/ui/components/media-setup/device-label';
// The styled pieces still live in the profile panel; moving them into a neutral
// module is a follow-up.
import Styled from '/imports/ui/components/profile-settings/styles';

export { AUDIO_INPUT, AUDIO_OUTPUT };

const intlMessages = defineMessages({
  noDeviceFound: {
    id: 'app.audio.noDeviceFound',
    description: 'No device found',
  },
});

interface AudioDeviceSelectorsProps {
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  selectedInputDeviceId: string;
  selectedOutputDeviceId: string;
  onSelectInputDevice: (deviceId: string) => void;
  onSelectOutputDevice: (deviceId: string) => void;
  inputDisabled?: boolean;
  inputAriaLabel?: string;
  outputAriaLabel?: string;
  inputDataTest?: string;
  outputDataTest?: string;
}

/**
 * The speaker and microphone selectors shared by the profile panel and the
 * pre-flight screen. Applying a device is left to the caller: in session it goes
 * live through the bridge, before the join it is only stored.
 */
const AudioDeviceSelectors: React.FC<AudioDeviceSelectorsProps> = ({
  inputDevices,
  outputDevices,
  selectedInputDeviceId,
  selectedOutputDeviceId,
  onSelectInputDevice,
  onSelectOutputDevice,
  inputDisabled = false,
  inputAriaLabel,
  outputAriaLabel,
  inputDataTest,
  outputDataTest,
}) => {
  const intl = useIntl();

  const getDeviceLabel = useAudioDeviceLabel();

  const renderOptions = (devices: MediaDeviceInfo[]) => devices.map((device, index) => (
    <MenuItem key={device.deviceId} value={device.deviceId}>
      {getDeviceLabel(device, index + 1)}
    </MenuItem>
  ));

  return (
    <>
      <Styled.DeviceContainer>
        <Styled.HeadphonesIcon />
        {outputDevices.length > 0
          ? (
            <Styled.DeviceSelector
              value={selectedOutputDeviceId}
              IconComponent={ExpandMoreIcon}
              onChange={(event: SelectChangeEvent<unknown>) => {
                onSelectOutputDevice(event.target.value as string);
              }}
              inputProps={outputAriaLabel ? { 'aria-label': outputAriaLabel } : undefined}
              data-test={outputDataTest}
            >
              {renderOptions(outputDevices)}
            </Styled.DeviceSelector>
          )
          : <span>{intl.formatMessage(intlMessages.noDeviceFound)}</span>}
      </Styled.DeviceContainer>
      <Styled.DeviceContainer>
        <Styled.MicIcon />
        {inputDevices.length > 0
          ? (
            <Styled.DeviceSelector
              value={selectedInputDeviceId}
              IconComponent={ExpandMoreIcon}
              disabled={inputDisabled}
              onChange={(event: SelectChangeEvent<unknown>) => {
                onSelectInputDevice(event.target.value as string);
              }}
              inputProps={inputAriaLabel ? { 'aria-label': inputAriaLabel } : undefined}
              data-test={inputDataTest}
            >
              {renderOptions(inputDevices)}
            </Styled.DeviceSelector>
          )
          : <span>{intl.formatMessage(intlMessages.noDeviceFound)}</span>}
      </Styled.DeviceContainer>
    </>
  );
};

export default AudioDeviceSelectors;
