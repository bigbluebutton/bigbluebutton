import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingsService from '/imports/ui/services/settings';
import Settings from './component';
import { LayoutContextFunc } from '../layout/context';

import {
  getUserRoles,
  showGuestNotification,
  updateSettings,
  getAvailableLocales,
} from './service';

const SettingsContainer = (props) => {
  const { layoutContextSelector } = LayoutContextFunc;
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

  return <Settings {...props} layoutContextDispatch={layoutContextDispatch} />;
};

export default withTracker(() => ({
  audio: SettingsService.audio,
  dataSaving: SettingsService.dataSaving,
  application: SettingsService.application,
  updateSettings,
  availableLocales: getAvailableLocales(),
  isModerator: getUserRoles() === 'MODERATOR',
  showGuestNotification: showGuestNotification(),
  showToggleLabel: false,
}))(SettingsContainer);
