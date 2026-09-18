const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// Whether the client is allowed to follow the operating system's
// light/dark preference (prefers-color-scheme). Requires the dark theme
// feature to be enabled and auto-detection to be turned on in the config.
export const isSystemThemeAutoDetectEnabled = () => {
  const darkThemeConfig = window.meetingClientSettings?.public?.app?.darkTheme;
  return Boolean(darkThemeConfig?.enabled && darkThemeConfig?.autoDetectFromSystem);
};

// Returns the MediaQueryList tracking the OS dark-mode preference, or null
// when matchMedia is unavailable (e.g. very old browsers / test envs).
export const getSystemDarkThemeMediaQuery = () => (
  typeof window.matchMedia === 'function'
    ? window.matchMedia(DARK_COLOR_SCHEME_QUERY)
    : null
);

// Whether the operating system currently prefers a dark color scheme.
export const systemPrefersDarkTheme = () => {
  const mediaQuery = getSystemDarkThemeMediaQuery();
  return Boolean(mediaQuery && mediaQuery.matches);
};

export default {
  isSystemThemeAutoDetectEnabled,
  getSystemDarkThemeMediaQuery,
  systemPrefersDarkTheme,
};
