import React from 'react';
import ShortcutsService from '/imports/ui/components/settings/submenus/shortcuts/service';

interface Shortcut {
  name: string;
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
    // Keyed by the shortcut's name, the name userdata-bbb_shortcuts refers to.
    let shortcuts: Shortcut[] = Object.entries(BASE_SHORTCUTS)
      .map(([name, { accesskey }]) => ({ name, accesskey }));

    if (ENABLED_SHORTCUTS) {
      const enabled = ENABLED_SHORTCUTS.map((name) => name.toLowerCase());
      shortcuts = shortcuts.filter((el) => enabled.includes(el.name.toLowerCase()));
    }

    let finalShortcuts: Shortcut[] | string | Record<string, string> = shortcuts;

    if (param !== undefined) {
      if (!Array.isArray(param)) {
        const found = shortcuts
          .filter((el) => el.name.toLowerCase() === param.toLowerCase())
          .map((el) => el.accesskey)
          .pop();
        finalShortcuts = found || '';
      } else {
        finalShortcuts = shortcuts
          .filter((el) => param.map((p) => p.toLowerCase()).includes(el.name.toLowerCase()))
          .reduce((acc, current) => {
            acc[current.name.toLowerCase()] = current.accesskey;
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
