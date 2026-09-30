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

export interface AudioDeviceSelection {
  /** Empty for the browser's default device. */
  inputDeviceId: string;
  outputDeviceId: string;
}

export type AudioMenuSection = 'processing' | 'deviceTest';

export interface AudioMenuProps {
  intl: IntlShape;
  settings: AudioSettings;
  audioSettings: AudioProcessingSettings;
  handleUpdateSettings: (settingsName: string, settings: AudioSettings | AudioProcessingSettings) => void;
  showProcessing: boolean;
  deviceSelection: AudioDeviceSelection;
  onDeviceSelectionChange: (selection: AudioDeviceSelection) => void;
}

export interface AudioMenuState {
  settings: AudioSettings;
  audioSettings: AudioProcessingSettings;
  audioFilterMode: AudioFilterMode;
  selectedSection: AudioMenuSection;
}
