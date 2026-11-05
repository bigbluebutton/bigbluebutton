import { useCallback, useMemo } from 'react';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import { getAccessKeyModifier } from '/imports/ui/components/settings/submenus/shortcuts/service';

/**
 * Returns a function that appends a button's keyboard shortcut to its tooltip
 * label, e.g. "Mute (Alt + M)", using the access key modifier of the user's
 * browser/OS. The label is returned untouched when the feature is disabled
 * (public.app.showShortcutsInTooltips / userdata-bbb_show_shortcuts_in_tooltips),
 * on mobile devices (no physical keyboard is assumed), when the shortcut is
 * disabled (empty access key) or when the browser modifier is unknown.
 *
 * `extraHint` is appended after the access key combo, for shortcuts that are not
 * handled through `accesskey` (e.g. push-to-talk).
 */
const useShortcutTooltip = () => {
  const enabled = useMemo(() => {
    const defaultValue = window.meetingClientSettings.public.app.showShortcutsInTooltips ?? true;
    return getFromUserSettings('bbb_show_shortcuts_in_tooltips', defaultValue) && !deviceInfo.isMobile;
  }, []);
  const modifier = useMemo(() => getAccessKeyModifier(), []);

  return useCallback((label: string, accessKey?: string, extraHint?: string): string => {
    if (!enabled) return label;
    const combo = accessKey && modifier ? `${modifier} + ${accessKey.toUpperCase()}` : '';
    const hints = [combo, extraHint].filter(Boolean).join(' · ');
    return hints ? `${label} (${hints})` : label;
  }, [enabled, modifier]);
};

export default useShortcutTooltip;
