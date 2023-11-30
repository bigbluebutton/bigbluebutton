import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingsService from '/imports/ui/services/settings';
import Settings from './component';
import { layoutDispatch } from '../layout/context';
import { isScreenSharingEnabled } from '/imports/ui/services/features';
import UserReactionService from '/imports/ui/components/user-reaction/service';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';

import {
  getUserRoles,
  isPresenter,
  showGuestNotification,
  updateSettings,
  getAvailableLocales,
} from './service';

const SettingsContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  return <Settings {...props} layoutContextDispatch={layoutContextDispatch} />;
};

export default withTracker((props) => ({
  ...props,
  audio: SettingsService.audio,
  dataSaving: SettingsService.dataSaving,
  application: SettingsService.application,
  transcription: SettingsService.transcription,
  updateSettings,
  availableLocales: getAvailableLocales(),
  isPresenter: isPresenter(),
  isModerator: getUserRoles() === 'MODERATOR',
  showGuestNotification: showGuestNotification(),
  showToggleLabel: false,
  isScreenSharingEnabled: isScreenSharingEnabled(),
  isVideoEnabled: Meteor.settings.public.kurento.enableVideo,
  isReactionsEnabled: UserReactionService.isEnabled(),
  isGladiaEnabled: SpeechService.isActive() && SpeechService.isGladia(),
}))(SettingsContainer);
