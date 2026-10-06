import { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  truncateDeviceName,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';

export const AUDIO_INPUT = 'audioinput';
export const AUDIO_OUTPUT = 'audiooutput';

const intlMessages = defineMessages({
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
});

/**
 * The browser leaves the label empty until the microphone permission is granted:
 * the device then shows as "Microphone N"/"Speaker N".
 */
const useAudioDeviceLabel = () => {
  const intl = useIntl();

  return useCallback((device: MediaDeviceInfo, index: number) => {
    if (device.label) return truncateDeviceName(device.label);

    const baseLabel = device.kind === AUDIO_OUTPUT
      ? intlMessages.fallbackOutputLabel
      : intlMessages.fallbackInputLabel;
    let label = intl.formatMessage(baseLabel, { index });

    if (!device.deviceId) {
      label = `${label} ${intl.formatMessage(intlMessages.fallbackNoPermissionLabel)}`;
    }

    return truncateDeviceName(label);
  }, [intl]);
};

export default useAudioDeviceLabel;
