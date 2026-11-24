import { useEffect, useState } from 'react';
import logger from '/imports/startup/client/logger';
import { hasMediaDevicesEventTarget } from '/imports/ui/services/webrtc-base/utils';
import { findAddedInputDevices } from '../service';

// The first enumeration is the baseline: devices present when watching starts
// are never reported as added.
const useAddedAudioInputs = (enabled: boolean): MediaDeviceInfo[] => {
  const [added, setAdded] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (!enabled || !hasMediaDevicesEventTarget()) return undefined;

    let active = true;
    let previous: MediaDeviceInfo[] | null = null;

    const updateDevices = () => {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          if (!active) return;
          const inputs = devices.filter((device) => device.kind === 'audioinput');
          const newInputs = findAddedInputDevices(previous, inputs);
          previous = inputs;
          if (newInputs.length > 0) setAdded(newInputs);
        })
        .catch((error) => {
          logger.warn({
            logCode: 'smart_triggers_device_enumeration_error',
            extraInfo: { errorName: error.name, errorMessage: error.message },
          }, `Smart triggers could not enumerate audio devices: ${error.message}`);
        });
    };

    updateDevices();
    navigator.mediaDevices.addEventListener('devicechange', updateDevices);

    return () => {
      active = false;
      navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
      setAdded([]);
    };
  }, [enabled]);

  return added;
};

export default useAddedAudioInputs;
