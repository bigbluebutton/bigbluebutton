const SETTINGS = {
  APPLICATION: 'application',
  AUDIO: 'audio',
  VIDEO: 'video',
  CC: 'cc',
  DATA_SAVING: 'dataSaving',
  ANIMATIONS: 'animations',
  SELF_VIEW_DISABLE: 'selfViewDisable',
  TRANSCRIPTION: 'transcription',
} as const;

const CHANGED_SETTINGS = 'changed_settings';
const DEFAULT_SETTINGS = 'default_settings';

export {
  SETTINGS,
  CHANGED_SETTINGS,
  DEFAULT_SETTINGS,
};

export default {
  SETTINGS,
  CHANGED_SETTINGS,
  DEFAULT_SETTINGS,
};
