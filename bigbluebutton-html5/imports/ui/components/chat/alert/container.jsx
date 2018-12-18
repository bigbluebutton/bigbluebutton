import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import Settings from '/imports/ui/services/settings';
import ChatAlert from './component';

const ChatAlertContainer = props => (
  <ChatAlert {...props} />
);

export default withTracker(() => {
  const AppSettings = Settings.application;
  const openChats = UserListService.getOpenChats();

  return {
    disableAudio: !AppSettings.chatAudioAlerts,
    disableNotify: !AppSettings.chatPushAlerts,
    openChats,
    publicUserId: Meteor.settings.public.chat.public_group_id,
  };
})(ChatAlertContainer);
