import getFromUserSettings from '/imports/ui/services/users-settings';
import { Meteor } from 'meteor/meteor'

interface ShortcutObject {
    accesskey: string,
    descId: string,
}

interface Accumulator {
    [key: string]: string,
}

const BASE_SHORTCUTS: Array<ShortcutObject> = Meteor.settings.public.app.shortcuts;

const useShortcutHelp = (param?: string) => {
    const ENABLED_SHORTCUTS = getFromUserSettings('bbb_shortcuts', null);
  let shortcuts: ShortcutObject[] = Object.values(BASE_SHORTCUTS);

  if (ENABLED_SHORTCUTS) {
    shortcuts = Object.values(BASE_SHORTCUTS).map((el: ShortcutObject) => {
      const obj = { ...el };
      obj.descId = obj.descId.toLowerCase();
      return obj;
    }).filter((el: ShortcutObject) => ENABLED_SHORTCUTS.includes(el.descId.toLowerCase()));
  }

  let shortcutsString: Object | undefined = {};
  if (param !== undefined) {
    if (!Array.isArray(param)) {
        shortcutsString = shortcuts
        .filter(el => el.descId.toLowerCase() === param.toLowerCase())
        .map(el => el.accesskey)
        .pop();
    } else {
        shortcutsString = shortcuts
        .filter(el => param.map(p => p.toLowerCase()).includes(el.descId.toLowerCase()))
        .reduce((acc: Accumulator, current: ShortcutObject) => {
          acc[current.descId.toLowerCase()] = current.accesskey;
          return acc;
        }, {});
    }
  }

  return shortcutsString;
}

export { useShortcutHelp };
