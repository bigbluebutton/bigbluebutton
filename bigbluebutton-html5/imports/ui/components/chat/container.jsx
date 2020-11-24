import React, { useEffect, useContext } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { ChatContext } from './chat-context/context';
import Chat from './component';
import ChatService from './service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;
const CHAT_CLEAR = CHAT_CONFIG.system_messages_keys.chat_clear;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const CONNECTION_STATUS = 'online';

const intlMessages = defineMessages({
  [CHAT_CLEAR]: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'Public chat title',
  },
  titlePrivate: {
    id: 'app.chat.titlePrivate',
    description: 'Private chat title',
  },
  partnerDisconnected: {
    id: 'app.chat.partnerDisconnected',
    description: 'System chat message when the private chat partnet disconnect from the meeting',
  },
});

const ChatContainer = (props) => {
  useEffect(() => {
    ChatService.removeFromClosedChatsSession();
  }, []);

  const usingChatContext = useContext(ChatContext);
  const {
    children,
    unmounting,
    chatID,
  } = props;
  if (unmounting === true) {
    return null;
  }

  const contextChat = usingChatContext.chats[chatID === PUBLIC_CHAT_KEY ? PUBLIC_GROUP_CHAT_KEY : chatID];
  return (
    <Chat {...{ ...props, chatID, contextChat }}>
      {children}
    </Chat>
  );
};

export default injectIntl(withTracker(({ intl }) => {
  const chatID = Session.get('idChatOpen');
  let isChatLocked = ChatService.isChatLocked(chatID);
  let title = intl.formatMessage(intlMessages.titlePublic);
  let chatName = title;
  let partnerIsLoggedOut = false;

  const currentUser = ChatService.getUser(Auth.userID);
  const amIModerator = currentUser.role === ROLE_MODERATOR;

  if (chatID === PUBLIC_CHAT_KEY) {
   
  } else if (chatID) {
   
  } else {
    // No chatID is set so the panel is closed, about to close, or wasn't opened correctly
    return {
      unmounting: true,
    };
  }



  const { connected: isMeteorConnected } = Meteor.status();

  return {
    chatID,
    chatName,
    title,
    messages: [],
    partnerIsLoggedOut,
    isChatLocked,
    isMeteorConnected,
    amIModerator,
    meetingIsBreakout: meetingIsBreakout(),
    actions: {
      handleClosePrivateChat: ChatService.closePrivateChat,
    },
  };
})(ChatContainer));
