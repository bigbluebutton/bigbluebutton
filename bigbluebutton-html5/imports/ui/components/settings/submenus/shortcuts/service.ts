import getFromUserSettings from '/imports/ui/services/users-settings';

export const BASE_SHORTCUTS = () => (window.meetingClientSettings.public.app.shortcuts);

export const ENABLED_SHORTCUTS = () => (
  getFromUserSettings('bbb_shortcuts', null) as string[] | null
);

export default {
  BASE_SHORTCUTS,
  ENABLED_SHORTCUTS,
};
