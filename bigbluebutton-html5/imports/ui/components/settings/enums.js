const SETTINGS_TABS = {
  APPLICATION: 'application',
  AUDIO: 'audio',
  NOTIFICATION: 'notification',
  DATA_SAVING: 'dataSaving',
  ROOM_MODE: 'roomMode',
  TRANSCRIPTION: 'transcription',
  SHORTCUTS: 'shortcuts',
  ABOUT: 'about',
};

// Single source of truth for tab order and gating. Both the rendered tab
// list and any numeric index (react-tabs' selectedIndex) are derived from
// this, so a tab being added/removed/gated can't drift out of sync with
// indices computed elsewhere.
const getSettingsTabs = ({
  isShowAudioFiltersEnabled,
  isAudioDeviceTestEnabled,
  isDataSavingTabEnabled,
  isGladiaEnabled,
  isRoomModeTabEnabled,
}) => [
  SETTINGS_TABS.APPLICATION,
  ...(isShowAudioFiltersEnabled || isAudioDeviceTestEnabled ? [SETTINGS_TABS.AUDIO] : []),
  SETTINGS_TABS.NOTIFICATION,
  ...(isDataSavingTabEnabled ? [SETTINGS_TABS.DATA_SAVING] : []),
  ...(isRoomModeTabEnabled ? [SETTINGS_TABS.ROOM_MODE] : []),
  ...(isGladiaEnabled ? [SETTINGS_TABS.TRANSCRIPTION] : []),
  SETTINGS_TABS.SHORTCUTS,
  SETTINGS_TABS.ABOUT,
];

export {
  SETTINGS_TABS,
  getSettingsTabs,
};

export default {
  SETTINGS_TABS,
  getSettingsTabs,
};
