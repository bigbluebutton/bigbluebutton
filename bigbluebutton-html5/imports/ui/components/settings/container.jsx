import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import SettingsService from '/imports/ui/services/settings';
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

export default withRouter(withTracker(() => ({
  audio: SettingsService.audio,
  video: SettingsService.video,
  application: SettingsService.application,
  cc: SettingsService.cc,
  participants: SettingsService.participants,
  updateSettings,
  locales: getClosedCaptionLocales(),
  availableLocales: getAvailableLocales(),
  isModerator: getUserRoles() === 'MODERATOR',
}))(SettingsContainer));
