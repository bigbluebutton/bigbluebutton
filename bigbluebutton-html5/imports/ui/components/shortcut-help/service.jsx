import React from 'react';
import getFromUserSettings from '/imports/ui/services/users-settings';

const BASE_SHORTCUTS = Meteor.settings.public.app.shortcuts;

const withShortcutHelper = (WrappedComponent, param) => (props) => {
  const ENABLED_SHORTCUTS = getFromUserSettings('bbb_shortcuts', null);
  let shortcuts = Object.values(BASE_SHORTCUTS);

  if (ENABLED_SHORTCUTS) {
    shortcuts = Object.values(BASE_SHORTCUTS).map((el) => {
      const obj = { ...el };
      obj.descId = obj.descId.toLowerCase();
      return obj;
    }).filter(el => ENABLED_SHORTCUTS.includes(el.descId.toLowerCase()));
  }

  if (param !== undefined) {
    if (!Array.isArray(param)) {
      shortcuts = shortcuts
        .filter(el => el.descId.toLowerCase() === param.toLowerCase())
        .map(el => el.accesskey)
        .pop();
    } else {
      shortcuts = shortcuts
        .filter(el => param.map(p => p.toLowerCase()).includes(el.descId.toLowerCase()))
        .reduce((acc, current) => {
          acc[current.descId.toLowerCase()] = current.accesskey;
          return acc;
        }, {});
    }
  }

  return (
    <WrappedComponent {...props} shortcuts={shortcuts} />
  );
};

export default withShortcutHelper;
