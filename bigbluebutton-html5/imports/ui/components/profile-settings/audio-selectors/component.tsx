/* eslint-disable no-underscore-dangle */
import { useReactiveVar } from '@apollo/client';
import React, { useCallback, useEffect } from 'react';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import { defineMessages, useIntl } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import {
  liveChangeInputDevice, liveChangeOutputDevice, notify, truncateDeviceName,
} from '../../audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import Styled from '../styles';
import AudioService from '/imports/ui/components/audio/service';

const AUDIO_INPUT = 'audioinput';
const AUDIO_OUTPUT = 'audiooutput';
const DEFAULT_DEVICE = 'default';

const intlMessages = defineMessages({
  changeAudioDevice: {
    id: 'app.audio.changeAudioDevice',
    description: 'Change audio device button label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio dropdown item label',
  },
  muteAudio: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteAudio: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
  },
  defaultOutputDeviceLabel: {
    id: 'app.audio.audioSettings.defaultOutputDeviceLabel',
    description: 'Default output device label',
  },
  loading: {
    id: 'app.audio.loading',
    description: 'Loading audio dropdown item label',
  },
  noDeviceFound: {
    id: 'app.audio.noDeviceFound',
    description: 'No device found',
  },
  microphones: {
    id: 'app.audio.microphones',
    description: 'Input audio dropdown item label',
  },
  speakers: {
    id: 'app.audio.speakers',
    description: 'Output audio dropdown item label',
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
  audioSettingsTitle: {
    id: 'app.audio.audioSettings.titleLabel',
    description: 'Audio settings button label',
  },
  noMicListenOnlyLabel: {
    id: 'app.audio.audioSettings.noMicListenOnly',
    description: 'No microphone (listen only) label',
  },
});

interface AudioSelectorsProps {
  inAudio: boolean;
}

const AudioSelectors: React.FC<AudioSelectorsProps> = ({
  inAudio,
}) => {
  const intl = useIntl();
  // @ts-expect-error TS6133: Unused variable.
  const [findingDevices, setFindingDevices] = React.useState(false);
  const [inputDevices, setInputDevices] = React.useState<InputDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = React.useState<MediaDeviceInfo[]>([]);
  const { enableDynamicAudioDeviceSelection } = window.meetingClientSettings.public.app;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const inputDeviceId = useReactiveVar(AudioManager._inputDeviceId.value) as string;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value) as string;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const permissionStatus = useReactiveVar(AudioManager._permissionStatus.value) as string;
  const updateInputDevices = (devices: InputDeviceInfo[] = []) => {
    AudioManager.inputDevices = devices;
  };
  const updateOutputDevices = (devices: MediaDeviceInfo[] = []) => {
    AudioManager.outputDevices = devices;
  };

  const updateRemovedDevices = useCallback((
    audioInputDevices: MediaDeviceInfo[],
    audioOutputDevices: MediaDeviceInfo[],
  ) => {
    if (inputDeviceId
      && (inputDeviceId !== DEFAULT_DEVICE)
      && !audioInputDevices.find((d) => d.deviceId === inputDeviceId)) {
      const fallbackInputDevice = audioInputDevices[0];

      if (fallbackInputDevice?.deviceId) {
        logger.warn({
          logCode: 'audio_input_live_selector',
          extraInfo: {
            fallbackDeviceId: fallbackInputDevice?.deviceId,
            fallbackDeviceLabel: fallbackInputDevice?.label,
          },
        }, 'Current input device was removed. Fallback to default device');
        liveChangeInputDevice(fallbackInputDevice.deviceId).catch(() => {
          notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
        });
      }
    }

    if (outputDeviceId
      && (outputDeviceId !== DEFAULT_DEVICE)
      && !audioOutputDevices.find((d) => d.deviceId === outputDeviceId)) {
      const fallbackOutputDevice = audioOutputDevices[0];

      if (fallbackOutputDevice?.deviceId) {
        logger.warn({
          logCode: 'audio_output_live_selector',
          extraInfo: {
            fallbackDeviceId: fallbackOutputDevice?.deviceId,
            fallbackDeviceLabel: fallbackOutputDevice?.label,
          },
        }, 'Current output device was removed. Fallback to default device');
        liveChangeOutputDevice(fallbackOutputDevice.deviceId, true).catch(() => {
          notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
        });
      }
    }
  }, [inputDeviceId, outputDeviceId]);

  const updateDevices = useCallback(() => {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const audioInputDevices = devices.filter((i) => i.kind === AUDIO_INPUT);
        const audioOutputDevices = devices.filter((i) => i.kind === AUDIO_OUTPUT);
        setInputDevices(audioInputDevices as InputDeviceInfo[]);
        setOutputDevices(audioOutputDevices);
        // Update audio devices in AudioManager
        updateInputDevices(audioInputDevices as InputDeviceInfo[]);
        updateOutputDevices(audioOutputDevices);

        if (inAudio) updateRemovedDevices(audioInputDevices, audioOutputDevices);
      })
      .catch((error) => {
        logger.warn({
          logCode: 'audio_device_enumeration_error',
          extraInfo: {
            errorMessage: error.message,
            errorName: error.name,
          },
        }, `Error enumerating audio devices: ${error.message}`);
      });
  }, [inAudio, inputDevices, outputDevices, updateRemovedDevices]);

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', updateDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
    };
  }, [updateDevices]);

  useEffect(() => {
    if (enableDynamicAudioDeviceSelection) {
      updateDevices();
    }
  }, [permissionStatus]);

  useEffect(() => {
    setFindingDevices(true);
    // ensure we have permission to access the microphone
    AudioService.hasMicrophonePermission({ gumOnPrompt: true, permissionStatus })
      .then((hasPermission) => {
        updateDevices();
        // null means undetermined, so we don't want to show the error modal
        // and let downstream components figure it out
        if (hasPermission === true || hasPermission === null) {
          return hasPermission;
        }

        // TODO: handle error
        /* handleGUMFailure(new DOMException(
            'Permissions API says denied',
            'NotAllowedError',
          )); */

        return false;
      })
      .catch(() => {
        // TODO: handle error
        // handleGUMFailure(error);
        return null;
      })
      .finally(() => {
        setFindingDevices(false);
      });
  }, []);

  const getFallbackLabel = (device: MediaDeviceInfo, index: number) => {
    const baseLabel = device?.kind === AUDIO_OUTPUT
      ? intlMessages.fallbackOutputLabel
      : intlMessages.fallbackInputLabel;
    let label = intl.formatMessage(baseLabel, { 0: index });

    if (!device?.deviceId) {
      label = `${label} ${intl.formatMessage(intlMessages.fallbackNoPermissionLabel)}`;
    }

    return label;
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onDeviceListClick = useCallback((deviceId: string, deviceKind: string, callback: Function) => {
    if (!deviceId) return;
    if (deviceKind === AUDIO_INPUT) {
      callback(deviceId).catch(() => {
        notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
      });
    } else {
      callback(deviceId, true).catch(() => {
        notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
      });
    }
  }, []);

  return (
    <>
      <Styled.DeviceContainer>
        <Styled.HeadphonesIcon />
        {outputDevices.length > 0
          ? (
            <Styled.DeviceSelector
              value={outputDeviceId || outputDevices[0].deviceId}
              IconComponent={ExpandMoreIcon}
              onChange={(event: SelectChangeEvent<unknown>) => {
                const deviceId = event.target.value as string;
                onDeviceListClick(deviceId, AUDIO_OUTPUT, liveChangeOutputDevice);
              }}
            >
              {outputDevices.map((device, index) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {truncateDeviceName(device.label || getFallbackLabel(device, index + 1))}
                </MenuItem>
              ))}
            </Styled.DeviceSelector>
          )
          : <span>{intl.formatMessage(intlMessages.noDeviceFound)}</span>}
      </Styled.DeviceContainer>
      <Styled.DeviceContainer>
        <Styled.MicIcon />
        {inputDevices.length > 0
          ? (
            <Styled.DeviceSelector
              value={inputDeviceId || inputDevices[0].deviceId}
              IconComponent={ExpandMoreIcon}
              onChange={(event: SelectChangeEvent<unknown>) => {
                const deviceId = event.target.value as string;
                onDeviceListClick(deviceId, AUDIO_INPUT, liveChangeInputDevice);
              }}
            >
              {inputDevices.map((device, index) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {truncateDeviceName(device.label || getFallbackLabel(device, index + 1))}
                </MenuItem>
              ))}
            </Styled.DeviceSelector>
          )
          : <span>{intl.formatMessage(intlMessages.noDeviceFound)}</span>}
      </Styled.DeviceContainer>
    </>
  );
};

export default AudioSelectors;
