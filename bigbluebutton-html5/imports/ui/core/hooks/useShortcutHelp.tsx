import getFromUserSettings from '/imports/ui/services/users-settings';
import { Meteor } from 'meteor/meteor'
import { useEffect, useState } from 'react'; 

interface ShortcutObject {
    accesskey: string,
    descId: string,
}

interface Accumulator {
    [key: string]: string,
}

type UseShortcutHelp = Object | string

const BASE_SHORTCUTS: Array<ShortcutObject> = Meteor.settings.public.app.shortcuts;

function useShortcutHelp(param: string): UseShortcutHelp {
  const [shortcut, setShortcut] = useState<UseShortcutHelp>("");

  useEffect(() => {
    const ENABLED_SHORTCUTS = getFromUserSettings('bbb_shortcuts', null);
    let shortcuts: ShortcutObject[] = Object.values(BASE_SHORTCUTS).map(
      (el: ShortcutObject) => { 
        return {
        ...el,
        descId: el.descId.toLowerCase(),
        }
    });

    if (ENABLED_SHORTCUTS) {
      shortcuts = Object.values(BASE_SHORTCUTS).filter((el: ShortcutObject) => 
        ENABLED_SHORTCUTS.includes(el.descId));
    }

    let shortcutsString: Object = "";
    if (!Array.isArray(param)) {
      shortcutsString = shortcuts
        .filter(el => {
          return el.descId === param.toLowerCase()})
        .map(el => {
          return el.accesskey})
        .pop() || "";
    } else {
        shortcutsString = shortcuts
        .filter(el => param.map(p => p.toLowerCase()).includes(el.descId.toLowerCase()))
        .reduce((acc: Accumulator, current: ShortcutObject) => {
          acc[current.descId.toLowerCase()] = current.accesskey;
          return acc;
        }, {});
    }
    setShortcut(shortcutsString);
  }, [])
  return shortcut;
}

export { useShortcutHelp, UseShortcutHelp };
