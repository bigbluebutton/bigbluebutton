import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingsService from '/imports/ui/services/settings';
import Settings from './component';
import { layoutDispatch } from '../layout/context';
import { isScreenSharingEnabled } from '/imports/ui/services/features';
import UserReactionService from '/imports/ui/components/user-reaction/service';

import {
  getUserRoles,
  isPresenter,
  showGuestNotification,
  updateSettings,
  getAvailableLocales,
} from './service';
import useUserChangedLocalSettings from '../../services/settings/hooks/useUserChangedLocalSettings';

const SettingsContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();
  const setLocalSettings = useUserChangedLocalSettings();

  return (
    <Settings
      {...props}
      layoutContextDispatch={layoutContextDispatch}
      setLocalSettings={setLocalSettings}
    />
  );
};

export default withTracker((props) => ({
  ...props,
  audio: SettingsService.audio,
  dataSaving: SettingsService.dataSaving,
  application: SettingsService.application,
  updateSettings,
  availableLocales: getAvailableLocales(),
  isPresenter: isPresenter(),
  isModerator: getUserRoles() === 'MODERATOR',
  showGuestNotification: showGuestNotification(),
  showToggleLabel: false,
  isScreenSharingEnabled: isScreenSharingEnabled(),
  isVideoEnabled: window.meetingClientSettings.public.kurento.enableVideo,
  isReactionsEnabled: UserReactionService.isEnabled(),
}))(SettingsContainer);
