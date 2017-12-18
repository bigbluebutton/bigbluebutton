import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import ShortcutHelpComponent from './component';

const ShortcutHelpContainer = props => (
  <ShortcutHelpComponent {...props} />
);

const getClientShortcuts = () => {
  const SHORTCUTS_CONFIG = Meteor.settings.public.shortcuts;
  const shortcuts = Object.values(SHORTCUTS_CONFIG);

  return shortcuts;
};

export default createContainer(() => ({
  shortcuts: getClientShortcuts(),
}), ShortcutHelpContainer);
