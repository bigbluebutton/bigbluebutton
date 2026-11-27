import { useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import { liveChangeInputDevice } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import useSmartTrigger from '../hooks/useSmartTrigger';
import useLocalAudioState from '../hooks/useLocalAudioState';
import useAddedAudioInputs from '../hooks/useAddedAudioInputs';
import { CooldownPolicy } from '../types';

const intlMessages = defineMessages({
  message: {
    id: 'app.smartTriggers.newMicrophone.message',
    description: 'Hint shown when a microphone is connected while in audio',
  },
  unnamedDevice: {
    id: 'app.smartTriggers.newMicrophone.unnamedDevice',
    description: 'Name used when the new microphone has no label',
  },
  switch: {
    id: 'app.smartTriggers.newMicrophone.action.switch',
    description: 'Action that switches to the new microphone',
  },
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
  },
});

// Each device is offered once (offeredDeviceIds), so the hint itself needs no
// cooldown.
const COOLDOWN: CooldownPolicy = { kind: 'time', ms: 0 };

const useNewMicrophoneRule = () => {
  const intl = useIntl();
  const { fire, clear } = useSmartTrigger('newMicrophone', COOLDOWN);
  const { isListenOnly, isConnected, inputDeviceId } = useLocalAudioState();
  const offeredDeviceIds = useRef(new Set<string>());
  const offeredDeviceId = useRef<string | null>(null);

  const watching = isConnected && !isListenOnly;
  const addedInputs = useAddedAudioInputs(watching);

  useEffect(() => {
    if (!watching) clear();
  }, [watching, clear]);

  useEffect(() => {
    if (offeredDeviceId.current && offeredDeviceId.current === inputDeviceId) clear();
  }, [inputDeviceId, clear]);

  useEffect(() => {
    const device = addedInputs.find(({ deviceId }) => (
      deviceId !== inputDeviceId && !offeredDeviceIds.current.has(deviceId)
    ));
    if (!device) return;

    const shown = fire({
      presentation: 'toast',
      icon: 'unmute',
      message: intl.formatMessage(intlMessages.message, {
        label: device.label || intl.formatMessage(intlMessages.unnamedDevice),
      }),
      actions: [{
        id: 'switch',
        label: intl.formatMessage(intlMessages.switch),
        onClick: () => {
          liveChangeInputDevice(device.deviceId).catch(() => {
            notify(intl.formatMessage(intlMessages.deviceChangeFailed), 'error');
          });
        },
      }],
    });
    if (!shown) return;

    offeredDeviceIds.current.add(device.deviceId);
    offeredDeviceId.current = device.deviceId;
  }, [addedInputs]);
};

export default useNewMicrophoneRule;
