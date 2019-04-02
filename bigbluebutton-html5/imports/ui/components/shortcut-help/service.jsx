import React from 'react';
import getFromUserSettings from '/imports/ui/services/users-settings';

const BASE_SHORTCUTS = Meteor.settings.public.app.shortcuts;

const withShortcutHelper = (WrappedComponent, param) => (props) => {
  const ENABLED_SHORTCUTS = getFromUserSettings('shortcuts', null);

  let shortcuts = Object.values(BASE_SHORTCUTS);

  if (ENABLED_SHORTCUTS) {
    shortcuts = Object.values(BASE_SHORTCUTS)
      .filter(el => ENABLED_SHORTCUTS.includes(el.descId));
  }

  if (param !== undefined) {
    if (!Array.isArray(param)) {
      shortcuts = shortcuts
        .filter(el => el.descId === param)
        .map(el => el.accesskey)
        .pop();
    } else {
      shortcuts = shortcuts
        .filter(el => param.includes(el.descId))
        .reduce((acc, current) => {
          acc[current.descId] = current.accesskey;
          return acc;
        }, {});
    }
  }

  return (
    <WrappedComponent {...props} shortcuts={shortcuts} />
  );
};

export default withShortcutHelper;
