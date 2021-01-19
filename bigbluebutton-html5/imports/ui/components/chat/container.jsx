import React, { useEffect, useContext, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { ChatContext, getLoginTime } from '../components-data/chat-context/context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import Chat from './component';
import _ from 'lodash';
import ChatService from './service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;
const CHAT_CLEAR = CHAT_CONFIG.system_messages_keys.chat_clear;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const CONNECTION_STATUS = 'online';
const DEBOUNCE_TIME = 100;

const sysMessagesIds = {
  welcomeId: `${SYSTEM_CHAT_TYPE}-welcome-msg`,
  moderatorId: `${SYSTEM_CHAT_TYPE}-moderator-msg`
 };

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

let lastExecution = 0;
let applyPropsToState = ()=> {};

const applyPropsToStateDebounced = _.debounce(()=> {
  const now = Date.now();
  ChatLogger.trace('lastExecution', lastExecution, now - lastExecution);
  lastExecution = now;

  applyPropsToState();
}, DEBOUNCE_TIME);

const ChatContainer = (props) => {
  useEffect(() => {
    ChatService.removeFromClosedChatsSession();
  }, []);
  const modOnlyMessage = Storage.getItem('ModeratorOnlyMessage');
  const { welcomeProp } = ChatService.getWelcomeProp();
  const {
    children,
    unmounting,
    chatID,
    amIModerator,
    loginTime,
  } = props;
  

  const systemMessages = {
    [sysMessagesIds.welcomeId]:{
      id: sysMessagesIds.welcomeId,
      content: [{
        id: sysMessagesIds.welcomeId,
        text: welcomeProp.welcomeMsg,
        time: loginTime,
      }],
      key: sysMessagesIds.welcomeId,
      time: loginTime,
      sender: null,
    },
    [sysMessagesIds.moderatorId]: {
      id: sysMessagesIds.moderatorId,
      content: [{
        id: sysMessagesIds.moderatorId,
        text: modOnlyMessage,
        time: loginTime+1,
      }],
      key: sysMessagesIds.moderatorId,
      time: loginTime+1,
      sender: null,
    }
  };

  const systemMessagesIds = [sysMessagesIds.welcomeId, amIModerator && modOnlyMessage && sysMessagesIds.moderatorId].filter(i=>i);

  const usingChatContext = useContext(ChatContext);
  const [stateLastMsg, setLastMsg] = useState(null);
  const [stateTimeWindows, setTimeWindows] = useState(chatID === PUBLIC_CHAT_KEY ? [...systemMessagesIds.map((item)=> systemMessages[item])]: [] );
  
  
  if (unmounting === true) {
    return null;
  }

  const contextChat = usingChatContext?.chats[chatID === PUBLIC_CHAT_KEY ? PUBLIC_GROUP_CHAT_KEY : chatID];
  const lastTimeWindow = contextChat?.lastTimewindow;
  const lastMsg = contextChat && (chatID === PUBLIC_CHAT_KEY 
  ? contextChat.preJoinMessages[lastTimeWindow] || contextChat.posJoinMessages[lastTimeWindow]
  : contextChat.messageGroups[lastTimeWindow]);
  
  let timeWindowsValues = [];
  
  applyPropsToState = ()=> {
      if (!_.isEqualWith(lastMsg, stateLastMsg) && lastMsg) {
        timeWindowsValues = chatID === PUBLIC_CHAT_KEY
        ? [...Object.values(contextChat.preJoinMessages), ...systemMessagesIds.map((item)=> systemMessages[item]), ...Object.values(contextChat.posJoinMessages)]
        : [...Object.values(contextChat.messageGroups)];
        setLastMsg({ ...lastMsg });
        setTimeWindows(timeWindowsValues);
      }
    }
  applyPropsToStateDebounced();
  return (
    <Chat {...{ ...props, chatID, amIModerator, count: 1, timeWindowsValues: stateTimeWindows, dispatch: usingChatContext?.dispatch }}>
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

  if (!chatID) {
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
    loginTime: getLoginTime(),
    actions: {
      handleClosePrivateChat: ChatService.closePrivateChat,
    },
  };
})(ChatContainer));
