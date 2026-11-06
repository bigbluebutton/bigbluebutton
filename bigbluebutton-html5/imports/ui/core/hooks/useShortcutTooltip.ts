import { useCallback, useMemo } from 'react';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import { getAccessKeyModifier } from '/imports/ui/components/settings/submenus/shortcuts/service';

// Apple's modifier key symbols, as shown in native macOS menus/tooltips.
const MAC_MODIFIER_SYMBOLS: Record<string, string> = {
  Control: '⌃',
  Option: '⌥',
  Shift: '⇧',
};

const formatCombo = (modifier: string, key: string): string => {
  if (!deviceInfo.isMacos) return `${modifier} + ${key}`;
  // Space separated so the glyphs don't merge into a single "drawing" (⌃ ⌥ M)
  return [...modifier.split(' + ').map((m) => MAC_MODIFIER_SYMBOLS[m] ?? m), key].join(' ');
};

/**
 * Returns a function that appends a button's keyboard shortcut to its tooltip
 * label, e.g. "Mute (Alt + M)", using the access key modifier of the user's
 * browser/OS. The label is returned untouched when the feature is disabled
 * (public.app.showShortcutsInTooltips / userdata-bbb_show_shortcuts_in_tooltips),
 * on mobile devices (no physical keyboard is assumed), when the shortcut is
 * disabled (empty access key) or when the browser modifier is unknown.
 *
 * On macOS the modifiers are shown with Apple's symbols, space separated (⌃ ⌥ M).
 *
 * `extraHint` is shown on a second line, for shortcuts that are not handled
 * through `accesskey` (e.g. push-to-talk).
 */
const useShortcutTooltip = () => {
  const enabled = useMemo(() => {
    const defaultValue = window.meetingClientSettings.public.app.showShortcutsInTooltips ?? true;
    return getFromUserSettings('bbb_show_shortcuts_in_tooltips', defaultValue) && !deviceInfo.isMobile;
  }, []);
  const modifier = useMemo(() => getAccessKeyModifier(), []);

  return useCallback((label: string, accessKey?: string, extraHint?: string): string => {
    if (!enabled) return label;
    const combo = accessKey && modifier ? formatCombo(modifier, accessKey.toUpperCase()) : '';
    const firstLine = combo ? `${label} (${combo})` : label;
    return extraHint ? `${firstLine}\n${extraHint}` : firstLine;
  }, [enabled, modifier]);
};

export default useShortcutTooltip;
