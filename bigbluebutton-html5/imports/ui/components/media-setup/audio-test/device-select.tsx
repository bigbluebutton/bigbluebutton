import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { SelectChangeEvent } from '@mui/material';
import { BBBSelect } from '@bigbluebutton/bbb-ui-components-react';
import useAudioDeviceLabel from '/imports/ui/components/media-setup/device-label';

const NO_DEVICE = 'no-device';

const intlMessages = defineMessages({
  noDeviceFound: {
    id: 'app.audio.noDeviceFound',
    description: 'No device found',
  },
});

interface AudioDeviceSelectProps {
  label: string;
  devices: MediaDeviceInfo[];
  /** Has to be one of `devices`: pick a fallback before rendering. */
  deviceId: string;
  onChange: (deviceId: string) => void;
  /** Shown when there is no device to pick. @default "No device found (listen only)" */
  emptyLabel?: string;
  disabled?: boolean;
  /** Set on the native `<select>`. */
  dataTest?: string;
}

/**
 * A labeled audio device dropdown. It only reports the pick: applying the device
 * is up to the caller.
 *
 * The list is the native one: the client's modals trap focus and swallow clicks
 * outside the trap, so a menu portaled to the body never takes a pick, and one
 * rendered inside the modal is positioned against the modal instead.
 */
const AudioDeviceSelect: React.FC<AudioDeviceSelectProps> = ({
  label,
  devices,
  deviceId,
  onChange,
  emptyLabel,
  disabled = false,
  dataTest,
}) => {
  const intl = useIntl();
  const getDeviceLabel = useAudioDeviceLabel();
  const hasDevices = devices.length > 0;

  return (
    <BBBSelect
      native
      title={label}
      value={hasDevices ? deviceId : NO_DEVICE}
      disabled={disabled || !hasDevices}
      onChange={(event: SelectChangeEvent<unknown>) => onChange(event.target.value as string)}
      inputProps={dataTest ? { 'data-test': dataTest } : undefined}
    >
      {hasDevices
        ? devices.map((device, index) => (
          <option key={device.deviceId || index} value={device.deviceId}>
            {getDeviceLabel(device, index + 1)}
          </option>
        ))
        : (
          <option value={NO_DEVICE}>
            {emptyLabel ?? intl.formatMessage(intlMessages.noDeviceFound)}
          </option>
        )}
    </BBBSelect>
  );
};

export default AudioDeviceSelect;
