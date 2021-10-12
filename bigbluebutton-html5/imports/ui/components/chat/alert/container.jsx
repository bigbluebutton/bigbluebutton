import React, { memo, useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import ChatAlert from './component';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import userListService from '/imports/ui/components/user-list/service';

const ChatAlertContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const usingChatContext = useContext(ChatContext);
  const usingGroupChatContext = useContext(GroupChatContext);

  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const { authTokenValidatedTime } = currentUser;
  const { chats: groupChatsMessages } = usingChatContext;
  const { groupChat: groupChats } = usingGroupChatContext;

  const activeChats = userListService.getActiveChats({ groupChatsMessages, groupChats, users });

  return (
    <ChatAlert {...props} activeChats={activeChats} messages={groupChatsMessages} joinTimestamp={authTokenValidatedTime} />
  );
};

export default withTracker(() => {
  const AppSettings = Settings.application;

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
    publicChatId: Meteor.settings.public.chat.public_group_id,
    idChatOpen,
  };
})(memo(ChatAlertContainer));
