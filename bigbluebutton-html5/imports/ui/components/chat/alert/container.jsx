import React, { memo, useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import ChatAlert from './component';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const ChatAlertContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.userID];
  const { authTokenValidatedTime } = currentUser;
  return (
    <ChatAlert {...props} joinTimestamp={authTokenValidatedTime} />
  );
};

export default withTracker(() => {
  const AppSettings = Settings.application;
  const activeChats = [];
  // UserListService.getActiveChats();

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
    idChatOpen,
  };
})(memo(ChatAlertContainer));
