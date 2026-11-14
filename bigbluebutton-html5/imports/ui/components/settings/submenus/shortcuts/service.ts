import getFromUserSettings from '/imports/ui/services/users-settings';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';

export const BASE_SHORTCUTS = () => (window.meetingClientSettings.public.app.shortcuts);

export const ENABLED_SHORTCUTS = () => (
  getFromUserSettings('bbb_shortcuts', null) as string[] | null
);

/**
 * Returns the modifier keys the current browser/OS combination uses to trigger
 * an element's `accesskey`, or null when it is unknown.
 * Overview of how browsers behave: https://www.w3schools.com/jsref/prop_html_accesskey.asp
 */
export const getAccessKeyModifier = (): string | null => {
  const { browserName } = browserInfo;
  const { isIos, isMacos } = deviceInfo;

  // all Browsers on MacOS are using Control + Option as access modifier
  // (checked first: iPads requesting the desktop site report macOS too)
  if (isMacos) return 'Control + Option';
  // all Browsers on iOS are using Control + Alt as access modifier
  if (isIos) return 'Control + Alt';

  switch (browserName) {
    case 'Chrome':
    case 'Microsoft Edge':
      return 'Alt';
    case 'Firefox':
      return 'Alt + Shift';
    default:
      return null;
  }
};

export default {
  BASE_SHORTCUTS,
  ENABLED_SHORTCUTS,
  getAccessKeyModifier,
};
