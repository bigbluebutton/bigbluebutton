import { useEffect } from 'react';
import { getSettingsSingletonInstance, hasPersistedChange } from '/imports/ui/services/settings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import getFromUserSettings from '/imports/ui/services/users-settings';
import {
  isSystemThemeAutoDetectEnabled,
  getSystemDarkThemeMediaQuery,
} from '/imports/ui/services/settings/system-theme';

// Whether the user has expressed an explicit theme preference that must take
// precedence over the operating system's prefers-color-scheme:
//  - the bbb_prefer_dark_theme join parameter, or
//  - a manually saved "Dark mode" toggle (persisted as a changed setting).
const hasUserThemePreference = () => {
  if (getFromUserSettings('bbb_prefer_dark_theme', undefined) !== undefined) {
    return true;
  }
  return hasPersistedChange(SETTINGS.APPLICATION, 'darkTheme');
};

// Keeps the theme in sync with the operating system's light/dark preference
// while the user has not chosen a theme manually. The initial value is set by
// the settings default (see services/settings/index.js); this hook handles the
// case where the OS preference changes while the meeting is open.
const useSystemThemeSync = () => {
  useEffect(() => {
    if (!isSystemThemeAutoDetectEnabled()) return undefined;

    const mediaQuery = getSystemDarkThemeMediaQuery();
    if (!mediaQuery) return undefined;

    const handleChange = (event: MediaQueryListEvent) => {
      // Respect an explicit user choice; only follow the OS otherwise.
      if (hasUserThemePreference()) return;

      const Settings = getSettingsSingletonInstance();
      // Update the reactive var so the theme is applied through the existing
      // settings -> App useEffect chain. This is intentionally not persisted,
      // so a subsequent OS change is still honored.
      Settings.application = {
        ...Settings.application,
        darkTheme: event.matches,
      };
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
};

export default useSystemThemeSync;
