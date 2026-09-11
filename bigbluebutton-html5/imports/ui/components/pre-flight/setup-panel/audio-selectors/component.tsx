/* eslint-disable no-underscore-dangle */
import { useReactiveVar } from '@apollo/client';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import {
  getStoredAudioInputDeviceId,
  storeAudioInputDeviceId,
} from '/imports/api/audio/client/bridge/service';
import {
  liveChangeOutputDevice, notify, truncateDeviceName,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import AudioService from '/imports/ui/components/audio/service';
import ProfileStyled from '/imports/ui/components/profile-settings/styles';

const AUDIO_INPUT = 'audioinput';
const AUDIO_OUTPUT = 'audiooutput';

const intlMessages = defineMessages({
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
  },
  noDeviceFound: {
    id: 'app.audio.noDeviceFound',
    description: 'No device found',
  },
  fallbackInputLabel: {
    id: 'app.audio.audioSettings.fallbackInputLabel',
    description: 'Audio input device label',
  },
  fallbackOutputLabel: {
    id: 'app.audio.audioSettings.fallbackOutputLabel',
    description: 'Audio output device label',
  },
  fallbackNoPermissionLabel: {
    id: 'app.audio.audioSettings.fallbackNoPermission',
    description: 'No permission to access audio devices label',
  },
  microphoneSourceLabel: {
    id: 'app.audio.audioSettings.microphoneSourceLabel',
    description: 'Label of the microphone selector',
  },
  speakerSourceLabel: {
    id: 'app.audio.audioSettings.speakerSourceLabel',
    description: 'Label of the speaker selector',
  },
});

interface PreFlightAudioSelectorsProps {
  listenOnly: boolean;
}

/**
 * Unlike the in-session selectors there is no audio bridge yet: the input device
 * is only stored, and AudioManager.init() reads it back when the audio connects.
 */
const PreFlightAudioSelectors: React.FC<PreFlightAudioSelectorsProps> = ({ listenOnly }) => {
  const intl = useIntl();
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [inputDeviceId, setInputDeviceId] = useState<string>(
    (getStoredAudioInputDeviceId() as string) || '',
  );
  const { enableDynamicAudioDeviceSelection } = window.meetingClientSettings.public.app;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value) as string;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const permissionStatus = useReactiveVar(AudioManager._permissionStatus.value) as string;

  const updateDevices = useCallback(() => {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const audioInputDevices = devices.filter((i) => i.kind === AUDIO_INPUT);
        const audioOutputDevices = devices.filter((i) => i.kind === AUDIO_OUTPUT);
        setInputDevices(audioInputDevices);
        setOutputDevices(audioOutputDevices);
        AudioManager.inputDevices = audioInputDevices;
        AudioManager.outputDevices = audioOutputDevices;

        // The id is stored for a later join: an unplugged device would leave a
        // stale one behind for the audio join to fail on.
        setInputDeviceId((currentDeviceId) => {
          if (!currentDeviceId) return currentDeviceId;
          if (audioInputDevices.some((d) => d.deviceId === currentDeviceId)) return currentDeviceId;

          const fallbackDeviceId = audioInputDevices[0]?.deviceId ?? '';
          logger.warn({
            logCode: 'preflight_audio_input_device_removed',
            extraInfo: { previousDeviceId: currentDeviceId, fallbackDeviceId },
          }, 'Selected input device is gone. Falling back to the first available one');
          storeAudioInputDeviceId(fallbackDeviceId);

          return fallbackDeviceId;
        });
      })
      .catch((error) => {
        logger.warn({
          logCode: 'preflight_audio_device_enumeration_error',
          extraInfo: {
            errorMessage: error.message,
            errorName: error.name,
          },
        }, `Error enumerating audio devices: ${error.message}`);
      });
  }, []);

  useEffect(() => {
    if (!enableDynamicAudioDeviceSelection) return undefined;

    navigator.mediaDevices.addEventListener('devicechange', updateDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
    };
  }, [enableDynamicAudioDeviceSelection, updateDevices]);

  useEffect(() => {
    if (enableDynamicAudioDeviceSelection) updateDevices();
  }, [enableDynamicAudioDeviceSelection, permissionStatus]);

  useEffect(() => {
    // Without microphone permission the browser obfuscates the device labels.
    AudioService.hasMicrophonePermission({ gumOnPrompt: true, permissionStatus })
      .then(() => updateDevices())
      .catch(() => null);
  }, []);

  const getFallbackLabel = (device: MediaDeviceInfo, index: number) => {
    const baseLabel = device?.kind === AUDIO_OUTPUT
      ? intlMessages.fallbackOutputLabel
      : intlMessages.fallbackInputLabel;
    let label = intl.formatMessage(baseLabel, { index });

    if (!device?.deviceId) {
      label = `${label} ${intl.formatMessage(intlMessages.fallbackNoPermissionLabel)}`;
    }

    return label;
  };

  const handleSelectInputDevice = useCallback((deviceId: string) => {
    if (!deviceId) return;
    storeAudioInputDeviceId(deviceId);
    setInputDeviceId(deviceId);
  }, []);

  const handleSelectOutputDevice = useCallback((deviceId: string) => {
    if (!deviceId) return;
    liveChangeOutputDevice(deviceId, true).catch(() => {
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
    });
  }, [intl]);

  const selectedOutputDeviceId = outputDevices.some((d) => d.deviceId === outputDeviceId)
    ? outputDeviceId
    : outputDevices[0]?.deviceId ?? '';
  const selectedInputDeviceId = inputDevices.some((d) => d.deviceId === inputDeviceId)
    ? inputDeviceId
    : inputDevices[0]?.deviceId ?? '';

  return (
    <>
      <ProfileStyled.DeviceContainer>
        <ProfileStyled.HeadphonesIcon />
        {outputDevices.length > 0
          ? (
            <ProfileStyled.DeviceSelector
              value={selectedOutputDeviceId}
              IconComponent={ExpandMoreIcon}
              onChange={(event: SelectChangeEvent<unknown>) => {
                handleSelectOutputDevice(event.target.value as string);
              }}
              inputProps={{ 'aria-label': intl.formatMessage(intlMessages.speakerSourceLabel) }}
              data-test="preFlightOutputDevice"
            >
              {outputDevices.map((device, index) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {truncateDeviceName(device.label || getFallbackLabel(device, index + 1))}
                </MenuItem>
              ))}
            </ProfileStyled.DeviceSelector>
          )
          : <span>{intl.formatMessage(intlMessages.noDeviceFound)}</span>}
      </ProfileStyled.DeviceContainer>
      <ProfileStyled.DeviceContainer>
        <ProfileStyled.MicIcon />
        {inputDevices.length > 0
          ? (
            <ProfileStyled.DeviceSelector
              value={selectedInputDeviceId}
              IconComponent={ExpandMoreIcon}
              disabled={listenOnly}
              onChange={(event: SelectChangeEvent<unknown>) => {
                handleSelectInputDevice(event.target.value as string);
              }}
              inputProps={{ 'aria-label': intl.formatMessage(intlMessages.microphoneSourceLabel) }}
              data-test="preFlightInputDevice"
            >
              {inputDevices.map((device, index) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {truncateDeviceName(device.label || getFallbackLabel(device, index + 1))}
                </MenuItem>
              ))}
            </ProfileStyled.DeviceSelector>
          )
          : <span>{intl.formatMessage(intlMessages.noDeviceFound)}</span>}
      </ProfileStyled.DeviceContainer>
    </>
  );
};

export default PreFlightAudioSelectors;
