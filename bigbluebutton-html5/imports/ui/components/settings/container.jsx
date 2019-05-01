import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingsService from '/imports/ui/services/settings';
import { notify } from '/imports/ui/services/notification';
import Settings from './component';

import {
  getClosedCaptionLocales,
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
  cc: SettingsService.cc,
  participants: SettingsService.participants,
  updateSettings,
  locales: getClosedCaptionLocales(),
  availableLocales: getAvailableLocales(),
  isModerator: getUserRoles() === 'MODERATOR',
  notify,
}))(SettingsContainer);
