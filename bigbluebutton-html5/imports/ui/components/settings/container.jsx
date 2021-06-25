import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingsService from '/imports/ui/services/settings';
import Settings from './component';
import { NLayoutContext } from '../layout/context/context';

import {
  getUserRoles,
  showGuestNotification,
  updateSettings,
  getAvailableLocales,
} from './service';

const SettingsContainer = props => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextDispatch } = newLayoutContext;

  return <Settings {...props} newLayoutContextDispatch={newLayoutContextDispatch} />
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
