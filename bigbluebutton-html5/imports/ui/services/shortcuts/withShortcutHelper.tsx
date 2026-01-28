import React from 'react';
import ShortcutsService from '/imports/ui/components/settings/submenus/shortcuts/service';

interface Shortcut {
  descId: string;
  accesskey: string;
}

export interface WithShortcutHelperProps {
    shortcuts: Shortcut[] | string | Record<string, string>;
}

const withShortcutHelper = <P extends WithShortcutHelperProps>(
  WrappedComponent: React.ComponentType<P>,
  param?: string | string[],
): React.FC<Omit<P, keyof WithShortcutHelperProps>> => {
  const Component = (props: Omit<P, keyof WithShortcutHelperProps>) => {
    const BASE_SHORTCUTS = ShortcutsService.BASE_SHORTCUTS();
    const ENABLED_SHORTCUTS = ShortcutsService.ENABLED_SHORTCUTS();
    let shortcuts: Shortcut[] = Object.values(BASE_SHORTCUTS);

    if (ENABLED_SHORTCUTS) {
      shortcuts = Object.values(BASE_SHORTCUTS).map((el) => {
        const obj = { ...el };
        obj.descId = obj.descId.toLowerCase();
        return obj;
      }).filter((el) => ENABLED_SHORTCUTS.includes(el.descId.toLowerCase()));
    }

    let finalShortcuts: Shortcut[] | string | Record<string, string> = shortcuts;

    if (param !== undefined) {
      if (!Array.isArray(param)) {
        const found = shortcuts
          .filter((el) => el.descId.toLowerCase() === param.toLowerCase())
          .map((el) => el.accesskey)
          .pop();
        finalShortcuts = found || '';
      } else {
        finalShortcuts = shortcuts
          .filter((el) => param.map((p) => p.toLowerCase()).includes(el.descId.toLowerCase()))
          .reduce((acc, current) => {
            acc[current.descId.toLowerCase()] = current.accesskey;
            return acc;
          }, {} as Record<string, string>);
      }
    }

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <WrappedComponent {...(props as P)} shortcuts={finalShortcuts} />
    );
  };
  return Component;
};

export default withShortcutHelper;
