import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import Settings from '/imports/ui/services/settings';
import ChatNotification from './component';

const ChatNotificationContainer = props => (
  <ChatNotification {...props} />
);

export default createContainer(() => {
  const AppSettings = Settings.application;
  const openChats = UserListService.getOpenChats();

  return {
    disableAudio: !AppSettings.chatAudioNotifications,
    disableNotify: !AppSettings.chatPushNotifications,
    openChats,
  };
}, ChatNotificationContainer);
