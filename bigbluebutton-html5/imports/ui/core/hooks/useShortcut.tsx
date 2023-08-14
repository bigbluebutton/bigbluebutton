import getFromUserSettings from '/imports/ui/services/users-settings';
import { Meteor } from 'meteor/meteor'
import { useEffect, useState } from 'react'; 

interface ShortcutObject {
    accesskey: string,
    descId: string,
}

// @ts-ignore - temporary, while meteor exists in the project
const BASE_SHORTCUTS: Array<ShortcutObject> = Meteor.settings.public.app.shortcuts;

function useShortcut(param: string): string {
  const [shortcut, setShortcut] = useState<string>("");

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

    let shortcutsString: string = "";
    
    shortcutsString = shortcuts
        .filter(el => {
          return el.descId === param.toLowerCase()})
        .map(el => {
          return el.accesskey})
        .pop() || "";
    
    setShortcut(shortcutsString);
  }, [])
  return shortcut;
}

export { useShortcut };
