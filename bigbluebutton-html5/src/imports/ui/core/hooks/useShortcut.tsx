import getFromUserSettings from '/imports/ui/services/users-settings';
import { useEffect, useState } from 'react';

interface ShortcutObject {
  accesskey: string;
  descId: string;
}

export function useShortcut(param: string): string {
  const [shortcut, setShortcut] = useState<string>('');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - temporary, while meteor exists in the project
  const BASE_SHORTCUTS: Array<ShortcutObject> = window.meetingClientSettings.public.app.shortcuts;

  useEffect(() => {
    const ENABLED_SHORTCUTS = getFromUserSettings('bbb_shortcuts', null);
    const filteredShortcuts: ShortcutObject[] = Object.values(BASE_SHORTCUTS).filter(
      (el: ShortcutObject) => (ENABLED_SHORTCUTS ? ENABLED_SHORTCUTS.includes(el.descId) : true),
    );

    const shortcutsString: string = filteredShortcuts
      .filter((el) => el.descId.toLowerCase() === param.toLowerCase())
      .map((el) => el.accesskey)
      .pop() || '';

    setShortcut(shortcutsString);
  }, [param]);

  return shortcut;
}

export default { useShortcut };
