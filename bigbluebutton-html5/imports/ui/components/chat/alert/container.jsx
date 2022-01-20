import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import ChatAlert from './component';
import LayoutContext from '../../layout/context';
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

// custom hook for getting previous value
function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const ChatAlertContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { idChatOpen, input } = layoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;
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

  const chatsTracker = {};

  if (usingChatContext.chats) {
    const chatsActive = Object.entries(usingChatContext.chats);
    chatsActive.forEach((c) => {
      try {
        if (c[0] === idChat || (c[0] === 'MAIN-PUBLIC-GROUP-CHAT' && idChat === 'public')) {
          chatsTracker[c[0]] = {};
          chatsTracker[c[0]].lastSender = users[Auth.meetingID][c[1]?.lastSender]?.name;
          if (c[1]?.posJoinMessages || c[1]?.messageGroups) {
            const m = Object.entries(c[1]?.posJoinMessages || c[1]?.messageGroups);
            chatsTracker[c[0]].count = m?.length;
            if (m[m.length - 1]) {
              chatsTracker[c[0]].content = m[m.length - 1][1]?.message;
            }
          }
        }
      } catch (e) {
        logger.error({
          logCode: 'chat_alert_component_error',
        }, 'Error : ', e.error);
      }
    });

    const prevTracker = usePrevious(chatsTracker);

    if (prevTracker) {
      const keys = Object.keys(prevTracker);
      keys.forEach((key) => {
        if (chatsTracker[key]?.count > prevTracker[key]?.count) {
          chatsTracker[key].shouldNotify = true;
        }
      });
    }
  }

  return (
    <ChatAlert
      {...props}
      chatsTracker={chatsTracker}
      layoutContextDispatch={layoutContextDispatch}
      unreadMessagesCountByChat={unreadMessagesCountByChat}
      unreadMessagesByChat={unreadMessagesByChat}
      idChatOpen={idChat}
    />
  );
};

ChatAlertContainer.propTypes = propTypes;

export default ChatAlertContainer;
