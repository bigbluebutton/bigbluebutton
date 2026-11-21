import getFromUserSettings from '/imports/ui/services/users-settings';
import { useEffect, useState } from 'react';

export function useShortcut(param: string): string {
  const [shortcut, setShortcut] = useState<string>('');

  // Keyed by the shortcut's name (openOptions, toggleMute, ...), the name userdata-bbb_shortcuts refers to.
  const BASE_SHORTCUTS = window.meetingClientSettings.public.app.shortcuts;

  useEffect(() => {
    const ENABLED_SHORTCUTS = getFromUserSettings('bbb_shortcuts', null) as string[] | null;
    const enabled = ENABLED_SHORTCUTS?.map((name) => name.toLowerCase());

    const shortcutsString: string = Object.entries(BASE_SHORTCUTS)
      .filter(([name]) => (enabled ? enabled.includes(name.toLowerCase()) : true))
      .filter(([name]) => name.toLowerCase() === param.toLowerCase())
      .map(([, el]) => el.accesskey)
      .pop() || '';

    setShortcut(shortcutsString);
  }, [param]);

  return shortcut;
}

export default { useShortcut };
