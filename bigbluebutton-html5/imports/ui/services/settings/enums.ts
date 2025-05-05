const SETTINGS = {
  LAYOUT: 'layout',
  APPLICATION: 'application',
  AUDIO: 'audio',
  VIDEO: 'video',
  CC: 'cc',
  DATA_SAVING: 'dataSaving',
  ANIMATIONS: 'animations',
  SELF_VIEW_DISABLE: 'selfViewDisable',
  TRANSCRIPTION: 'transcription',
} as const;

// keys inside this array will be saved with the meeting id appended to it
// so they don't persist between meetings even when using local storage.
const MEETING_SCOPED_SETTINGS = [
  'layout',
];

const CHANGED_SETTINGS = 'changed_settings';
const DEFAULT_SETTINGS = 'default_settings';

export {
  SETTINGS,
  MEETING_SCOPED_SETTINGS,
  CHANGED_SETTINGS,
  DEFAULT_SETTINGS,
};

export default {
  SETTINGS,
  MEETING_SCOPED_SETTINGS,
  CHANGED_SETTINGS,
  DEFAULT_SETTINGS,
};
