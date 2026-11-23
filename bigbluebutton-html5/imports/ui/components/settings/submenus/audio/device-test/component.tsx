import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import AudioDeviceSelect from '/imports/ui/components/media-setup/audio-test/device-select';
import AudioLevelMeter from '/imports/ui/components/media-setup/audio-test/level-meter';
import HearMyselfButton from '/imports/ui/components/media-setup/audio-test/hear-myself-button';
import {
  resolveDeviceId,
  useAudioDevices,
  useAudioPreviewStream,
} from '/imports/ui/components/media-setup/audio-test/hooks';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { AudioDeviceSelection } from '../types';
import Styled from '../styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.submenu.audio.deviceTestTitle',
    description: 'Title of the device test section',
  },
  description: {
    id: 'app.audio.audioSettings.baseSubtitle',
    description: 'Description of the device test section',
  },
  microphoneLabel: {
    id: 'app.audio.audioSettings.microphoneSourceLabel',
    description: 'Label of the microphone selector',
  },
  speakerLabel: {
    id: 'app.audio.audioSettings.speakerSourceLabel',
    description: 'Label of the speaker selector',
  },
  volumeLabel: {
    id: 'app.audio.audioSettings.microphoneStreamLabel',
    description: 'Label of the microphone level meter',
  },
  defaultOutputDeviceLabel: {
    id: 'app.audio.audioSettings.defaultOutputDeviceLabel',
    description: 'Shown when the browser cannot pick an output device',
  },
});

interface DeviceTestProps {
  selection: AudioDeviceSelection;
  onSelectionChange: (selection: AudioDeviceSelection) => void;
}

/**
 * Picks the microphone and the speaker while testing them. The picks only reach
 * the audio on save: see applyAudioDeviceSelection.
 */
const DeviceTest: React.FC<DeviceTestProps> = ({ selection, onSelectionChange }) => {
  const intl = useIntl();
  const { animations } = getSettingsSingletonInstance().application;
  const { inputDevices, outputDevices, refreshDevices } = useAudioDevices();
  // Once the microphone opens, the permission is granted and the labels readable.
  const { stream, deviceId: openedInputDeviceId } = useAudioPreviewStream(
    selection.inputDeviceId,
    refreshDevices,
  );
  // A pick shows at once; without one (or with an unplugged one), the device the
  // browser opened does.
  const isPickListed = inputDevices.some((d) => d.deviceId === selection.inputDeviceId);
  const inputDeviceId = resolveDeviceId(
    inputDevices,
    isPickListed ? selection.inputDeviceId : openedInputDeviceId,
  );
  const outputDeviceId = resolveDeviceId(outputDevices, selection.outputDeviceId);

  return (
    <Styled.DeviceTestContainer>
      <Styled.SectionHeader>
        <Styled.AudioTitle>
          {intl.formatMessage(intlMessages.title)}
        </Styled.AudioTitle>
        <Styled.SectionDescription>
          {intl.formatMessage(intlMessages.description)}
        </Styled.SectionDescription>
      </Styled.SectionHeader>
      <AudioDeviceSelect
        label={intl.formatMessage(intlMessages.microphoneLabel)}
        devices={inputDevices}
        deviceId={inputDeviceId}
        onChange={(deviceId) => onSelectionChange({ ...selection, inputDeviceId: deviceId })}
        dataTest="audioTestInputDevice"
      />
      <Styled.SpeakerRow>
        <Styled.SpeakerSelect>
          <AudioDeviceSelect
            label={intl.formatMessage(intlMessages.speakerLabel)}
            devices={outputDevices}
            deviceId={outputDeviceId}
            onChange={(deviceId) => onSelectionChange({ ...selection, outputDeviceId: deviceId })}
            emptyLabel={intl.formatMessage(intlMessages.defaultOutputDeviceLabel)}
            dataTest="audioTestOutputDevice"
          />
        </Styled.SpeakerSelect>
        <HearMyselfButton
          stream={stream}
          outputDeviceId={outputDeviceId || null}
          dataTest="audioTestHearMyselfButton"
        />
      </Styled.SpeakerRow>
      <AudioLevelMeter
        stream={stream}
        label={intl.formatMessage(intlMessages.volumeLabel)}
        animations={animations}
        dataTest="audioTestVolumeMeter"
      />
    </Styled.DeviceTestContainer>
  );
};

export default DeviceTest;
