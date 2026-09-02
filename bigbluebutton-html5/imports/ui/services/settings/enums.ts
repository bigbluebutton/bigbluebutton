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

// Settings groups whose persistence is decided by a public.app flag of their
// own instead of by userSettingsStorage, mapped to that flag's name. The flag
// takes 'session' - sessionStorage, under a key scoped to the meeting, so the
// value survives neither a new browser session nor a new meeting - or 'local',
// which hands the group back to the ordinary rules. For settings that must not
// follow a user around unless an admin opts in.
const SETTINGS_STORAGE_FLAGS: Record<string, string> = {
  audio: 'audioFilterStorage',
};

const CHANGED_SETTINGS = 'changed_settings';
const DEFAULT_SETTINGS = 'default_settings';

export {
  SETTINGS,
  MEETING_SCOPED_SETTINGS,
  SETTINGS_STORAGE_FLAGS,
  CHANGED_SETTINGS,
  DEFAULT_SETTINGS,
};

export default {
  SETTINGS,
  MEETING_SCOPED_SETTINGS,
  SETTINGS_STORAGE_FLAGS,
  CHANGED_SETTINGS,
  DEFAULT_SETTINGS,
};
