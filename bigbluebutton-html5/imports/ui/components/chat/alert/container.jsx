import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ChatAlert from './component';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '../../layout/context';
import { PANELS } from '../../layout/enums';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import userListService from '/imports/ui/components/user-list/service';
import UnreadMessages from '/imports/ui/services/unread-messages';

const PUBLIC_CHAT_ID = Meteor.settings.public.chat.public_group_id;

const propTypes = {
  audioAlertEnabled: PropTypes.bool.isRequired,
  pushAlertEnabled: PropTypes.bool.isRequired,
};

const ChatAlertContainer = (props) => {
  const idChatOpen = layoutSelect((i) => i.idChatOpen);
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const { audioAlertEnabled, pushAlertEnabled } = props;

  let idChat = idChatOpen;
  if (sidebarContentPanel !== PANELS.CHAT) idChat = '';

  const usingUsersContext = useContext(UsersContext);
  const usingChatContext = useContext(ChatContext);
  const usingGroupChatContext = useContext(GroupChatContext);

  const { users } = usingUsersContext;
  const { chats: groupChatsMessages } = usingChatContext;
  const { groupChat: groupChats } = usingGroupChatContext;

  const activeChats = userListService.getActiveChats({ groupChatsMessages, groupChats, users });

  // audio alerts
  const unreadMessagesCountByChat = audioAlertEnabled
    ? activeChats.map((chat) => ({
      chatId: chat.chatId, unreadCounter: chat.unreadCounter,
    }))
    : null;

  // push alerts
  const unreadMessagesByChat = pushAlertEnabled
    ? activeChats.filter(
      (chat) => chat.unreadCounter > 0 && chat.chatId !== idChat,
    ).map((chat) => {
      const chatId = (chat.chatId === 'public') ? PUBLIC_CHAT_ID : chat.chatId;
      return UnreadMessages.getUnreadMessages(chatId, groupChatsMessages);
    })
    : null;

  return (
    <ChatAlert
      {...props}
      layoutContextDispatch={layoutContextDispatch}
      unreadMessagesCountByChat={unreadMessagesCountByChat}
      unreadMessagesByChat={unreadMessagesByChat}
      idChatOpen={idChat}
    />
  );
};

ChatAlertContainer.propTypes = propTypes;

export default ChatAlertContainer;
