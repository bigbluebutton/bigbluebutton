import React, { memo, useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import ChatAlert from './component';
import Auth from '/imports/ui/services/auth';
import { NLayoutContext } from '../../layout/context/context';
import { PANELS } from '../../layout/enums';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import userListService from '/imports/ui/components/user-list/service';

const ChatAlertContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState } = newLayoutContext;
  const { idChatOpen, input } = newLayoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;

  if (!idChatOpen) return false;

  let idChat = idChatOpen;
  if (sidebarContentPanel !== PANELS.CHAT) idChat = '';

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
    <ChatAlert
      {...props}
      activeChats={activeChats}
      messages={groupChatsMessages}
      joinTimestamp={authTokenValidatedTime}
      idChatOpen={idChat}
    />
  );
};

export default withTracker(() => {
  const AppSettings = Settings.application;

  return {
    audioAlertDisabled: !AppSettings.chatAudioAlerts,
    pushAlertDisabled: !AppSettings.chatPushAlerts,
    publicChatId: Meteor.settings.public.chat.public_group_id,
  };
})(memo(ChatAlertContainer));
