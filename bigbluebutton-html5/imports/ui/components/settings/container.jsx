import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingsService from '/imports/ui/services/settings';
import Settings from './component';

import {
  getUserRoles,
  updateSettings,
  getAvailableLocales,
} from './service';

const SettingsContainer = props => (
  <Settings {...props} />
);

export default withTracker(() => ({
  audio: SettingsService.audio,
  dataSaving: SettingsService.dataSaving,
  application: SettingsService.application,
  updateSettings,
  availableLocales: getAvailableLocales(),
  isModerator: getUserRoles() === 'MODERATOR',
}))(SettingsContainer);
