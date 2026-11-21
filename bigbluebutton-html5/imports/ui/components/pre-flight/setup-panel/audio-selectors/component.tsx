/* eslint-disable no-underscore-dangle */
import { useReactiveVar } from '@apollo/client';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import {
  getStoredAudioInputDeviceId,
  storeAudioInputDeviceId,
} from '/imports/api/audio/client/bridge/service';
import {
  liveChangeOutputDevice, notify,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import AudioService from '/imports/ui/components/audio/service';
import AudioDeviceSelectors, {
  AUDIO_INPUT,
  AUDIO_OUTPUT,
} from '/imports/ui/components/media-setup/audio-selectors/component';
import { usePreFlight } from '../../context';

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
  permissionPending: {
    id: 'app.preFlight.devicePermissionPending',
    description: 'Shown under a device selector whose permission the browser refused',
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
  const {
    microphoneDenied, setMicrophoneDenied, setMicrophonePending, permissionRetry,
  } = usePreFlight();
  // Bumped when the browser's own microphone permission changes, so a grant
  // made in the site settings clears the denial without a retry.
  const [permissionChanges, setPermissionChanges] = useState(0);
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [inputDeviceId, setInputDeviceId] = useState<string>(
    (getStoredAudioInputDeviceId() as string) || '',
  );
  const { enableDynamicAudioDeviceSelection } = window.meetingClientSettings.public.app;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const managerInputDeviceId = useReactiveVar(AudioManager._inputDeviceId.value) as string | null;
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

        const currentOutputDeviceId = AudioManager.outputDeviceId;
        const outputDeviceGone = currentOutputDeviceId
          && !audioOutputDevices.some((d) => d.deviceId === currentOutputDeviceId);

        if (outputDeviceGone && audioOutputDevices[0]?.deviceId) {
          const fallbackDeviceId = audioOutputDevices[0].deviceId;
          logger.warn({
            logCode: 'preflight_audio_output_device_removed',
            extraInfo: { previousDeviceId: currentOutputDeviceId, fallbackDeviceId },
          }, 'Selected output device is gone. Falling back to the first available one');
          // No ToastContainer before the join: a failure is logged, not notified.
          liveChangeOutputDevice(fallbackDeviceId, true).catch((error) => {
            logger.error({
              logCode: 'preflight_audio_output_device_fallback_failed',
              extraInfo: {
                fallbackDeviceId,
                errorMessage: error.message,
                errorName: error.name,
              },
            }, `Failed to fall back to the first available output device: ${error.message}`);
          });
        }
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
    let permission: PermissionStatus | null = null;
    // The query can settle after the cleanup ran: the listener is then never
    // added, rather than added for good.
    let cancelled = false;
    const handleChange = () => setPermissionChanges((count) => count + 1);

    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then((status) => {
        if (cancelled) return;
        permission = status;
        permission.addEventListener('change', handleChange);
      })
      // Not every browser names the microphone here; the retry still works.
      .catch(() => null);

    return () => {
      cancelled = true;
      permission?.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (listenOnly) {
      updateDevices();
      return undefined;
    }

    // Only the latest check settles the pending state.
    let superseded = false;
    setMicrophonePending(true);
    // Without microphone permission the browser obfuscates the device labels.
    // Only a refusal counts as denied: an unknown answer gets the benefit of
    // the doubt, as in the audio modal.
    AudioService.hasMicrophonePermission({ gumOnPrompt: true, permissionStatus })
      .then((granted: boolean | null) => {
        setMicrophoneDenied(granted === false);
        updateDevices();
      })
      .catch(() => null)
      .finally(() => {
        if (!superseded) setMicrophonePending(false);
      });

    return () => {
      superseded = true;
      setMicrophonePending(false);
    };
  }, [listenOnly, permissionStatus, permissionRetry, permissionChanges, updateDevices]);

  // A microphone picked in the settings' device test lands in the manager.
  useEffect(() => {
    if (managerInputDeviceId) setInputDeviceId(managerInputDeviceId);
  }, [managerInputDeviceId]);

  const handleSelectInputDevice = useCallback((deviceId: string) => {
    if (!deviceId) return;
    storeAudioInputDeviceId(deviceId);
    // Keeps the settings' device test on the same microphone.
    AudioManager.changeInputDevice(deviceId);
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
    <AudioDeviceSelectors
      inputDevices={inputDevices}
      outputDevices={outputDevices}
      selectedInputDeviceId={selectedInputDeviceId}
      selectedOutputDeviceId={selectedOutputDeviceId}
      onSelectInputDevice={handleSelectInputDevice}
      onSelectOutputDevice={handleSelectOutputDevice}
      inputDisabled={listenOnly}
      inputError={microphoneDenied && !listenOnly
        ? intl.formatMessage(intlMessages.permissionPending)
        : undefined}
      inputAriaLabel={intl.formatMessage(intlMessages.microphoneSourceLabel)}
      outputAriaLabel={intl.formatMessage(intlMessages.speakerSourceLabel)}
      inputPlaceholder={intl.formatMessage(intlMessages.microphoneSourceLabel)}
      outputPlaceholder={intl.formatMessage(intlMessages.speakerSourceLabel)}
      inputDataTest="preFlightInputDevice"
      inputErrorDataTest="preFlightInputDeviceError"
      outputDataTest="preFlightOutputDevice"
    />
  );
};

export default PreFlightAudioSelectors;
