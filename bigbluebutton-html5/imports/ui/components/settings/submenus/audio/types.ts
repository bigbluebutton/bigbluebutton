import { IntlShape, MessageDescriptor } from 'react-intl';

export type AudioFilterMode = 'advanced' | 'standard' | 'original';

export type ConstraintValue = boolean | string | { exact?: boolean; ideal?: boolean };

export interface MicrophoneConstraints {
  autoGainControl?: ConstraintValue;
  echoCancellation?: ConstraintValue;
  noiseSuppression?: ConstraintValue;
  advanced?: Record<string, ConstraintValue>;
}

export interface AudioSettings {
  microphoneConstraints?: MicrophoneConstraints;
  [key: string]: unknown;
}

export interface AudioProcessingSettings {
  processingMode?: AudioFilterMode;
  [key: string]: unknown;
}

export interface AudioFilterOption {
  value: AudioFilterMode;
  titleMsg: MessageDescriptor;
  descMsg: MessageDescriptor;
  disabled: boolean;
  disabledReasonMsg?: MessageDescriptor;
  dataTest: string;
}

export interface AudioMenuProps {
  intl: IntlShape;
  settings: AudioSettings;
  audioSettings: AudioProcessingSettings;
  handleUpdateSettings: (settingsName: string, settings: AudioSettings | AudioProcessingSettings) => void;
}

export interface AudioMenuState {
  settings: AudioSettings;
  audioSettings: AudioProcessingSettings;
  audioFilterMode: AudioFilterMode;
}
