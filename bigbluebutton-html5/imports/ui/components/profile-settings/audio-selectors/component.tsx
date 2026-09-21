/* eslint-disable no-underscore-dangle */
import { useReactiveVar } from '@apollo/client';
import React, { useCallback, useEffect } from 'react';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import { defineMessages, useIntl } from 'react-intl';
import {
  liveChangeInputDevice, liveChangeOutputDevice, notify,
} from '../../audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import AudioService from '/imports/ui/components/audio/service';
import AudioDeviceSelectors, {
  AUDIO_INPUT,
  AUDIO_OUTPUT,
} from '/imports/ui/components/media-setup/audio-selectors/component';

const DEFAULT_DEVICE = 'default';

const intlMessages = defineMessages({
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
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

interface AudioSelectorsProps {
  inAudio: boolean;
}

const AudioSelectors: React.FC<AudioSelectorsProps> = ({
  inAudio,
}) => {
  const intl = useIntl();
  // @ts-expect-error TS6133: Unused variable
  const [findingDevices, setFindingDevices] = React.useState(false); // eslint-disable-line
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

  const handleSelectInputDevice = useCallback((deviceId: string) => {
    if (!deviceId) return;
    liveChangeInputDevice(deviceId).catch(() => {
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
    });
  }, [intl]);

  const handleSelectOutputDevice = useCallback((deviceId: string) => {
    if (!deviceId) return;
    liveChangeOutputDevice(deviceId, true).catch(() => {
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
    });
  }, [intl]);

  return (
    <AudioDeviceSelectors
      inputDevices={inputDevices}
      outputDevices={outputDevices}
      selectedInputDeviceId={inputDeviceId || inputDevices[0]?.deviceId || ''}
      selectedOutputDeviceId={outputDeviceId || outputDevices[0]?.deviceId || ''}
      onSelectInputDevice={handleSelectInputDevice}
      onSelectOutputDevice={handleSelectOutputDevice}
      inputAriaLabel={intl.formatMessage(intlMessages.microphoneSourceLabel)}
      outputAriaLabel={intl.formatMessage(intlMessages.speakerSourceLabel)}
      inputDataTest="profileInputDevice"
      outputDataTest="profileOutputDevice"
    />
  );
};

export default AudioSelectors;
