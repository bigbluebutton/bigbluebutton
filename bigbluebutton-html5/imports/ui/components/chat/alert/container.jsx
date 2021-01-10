import React, { memo } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import Settings from '/imports/ui/services/settings';
import ChatAlert from './component';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';

const ChatAlertContainer = props => (
  <ChatAlert {...props} />
);

export default withTracker(() => {
  const AppSettings = Settings.application;
  const activeChats = UserListService.getActiveChats();
  const { loginTime } = Users.findOne({ userId: Auth.userID }, { fields: { loginTime: 1 } });

  const openPanel = Session.get('openPanel');
  let idChatOpen = Session.get('idChatOpen');

  // Currently the panel can switch from the chat panel to something else and the idChatOpen won't
  // always reset. A better solution would be to make the openPanel Session variable an
  // Object { panelType: <String>, panelOptions: <Object> } and then get rid of idChatOpen
  if (openPanel !== 'chat') {
    idChatOpen = '';
  }

  return {
    audioAlertDisabled: !AppSettings.chatAudioAlerts,
    pushAlertDisabled: !AppSettings.chatPushAlerts,
    activeChats,
    publicUserId: Meteor.settings.public.chat.public_group_id,
    joinTimestamp: loginTime,
    idChatOpen,
  };
})(memo(ChatAlertContainer));
