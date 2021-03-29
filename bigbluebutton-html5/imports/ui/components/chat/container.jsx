import React, { useEffect, useContext, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import _ from 'lodash';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { ChatContext, getLoginTime } from '../components-data/chat-context/context';
import { GroupChatContext } from '../components-data/group-chat-context/context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import Chat from './component';
import ChatService from './service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;
const CHAT_CLEAR = CHAT_CONFIG.system_messages_keys.chat_clear;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const CONNECTION_STATUS = 'online';
const DEBOUNCE_TIME = 1000;

const sysMessagesIds = {
  welcomeId: `${SYSTEM_CHAT_TYPE}-welcome-msg`,
  moderatorId: `${SYSTEM_CHAT_TYPE}-moderator-msg`,
  syncId: `${SYSTEM_CHAT_TYPE}-sync-msg`
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
  loading: {
    id: 'app.chat.loading',
    description: 'loading message',
  },
});

let previousChatId = null;
let prevSync = false;

let globalAppplyStateToProps = () => { }

const throttledFunc = _.throttle(() => {
  globalAppplyStateToProps();
}, DEBOUNCE_TIME, { trailing: true, leading: true });

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
    intl,
  } = props;

  ChatLogger.debug('ChatContainer::render::props', props);

  const isPublicChat = chatID === PUBLIC_CHAT_KEY;
  const systemMessages = {
    [sysMessagesIds.welcomeId]: {
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
        time: loginTime + 1,
      }],
      key: sysMessagesIds.moderatorId,
      time: loginTime + 1,
      sender: null,
    }
  };

  const systemMessagesIds = [sysMessagesIds.welcomeId, amIModerator && modOnlyMessage && sysMessagesIds.moderatorId].filter(i => i);

  const usingChatContext = useContext(ChatContext);
  const usingGroupChatContext = useContext(GroupChatContext);
  const [stateLastMsg, setLastMsg] = useState(null);
  const [stateTimeWindows, setTimeWindows] = useState(isPublicChat ? [...systemMessagesIds.map((item) => systemMessages[item])] : []);
  const [lastTimeWindowValuesBuild, setLastTimeWindowValuesBuild] = useState(0);

  const { groupChat } = usingGroupChatContext;
  const participants = groupChat[chatID]?.participants;
  const chatName = participants?.filter((user) => user.id !== Auth.userID)[0]?.name;
  const title = chatName ? intl.formatMessage(intlMessages.titlePrivate, { 0: chatName}) : intl.formatMessage(intlMessages.titlePublic);

  if (unmounting === true) {
    return null;
  }

  const contextChat = usingChatContext?.chats[isPublicChat ? PUBLIC_GROUP_CHAT_KEY : chatID];
  const lastTimeWindow = contextChat?.lastTimewindow;
  const lastMsg = contextChat && (isPublicChat
    ? contextChat?.preJoinMessages[lastTimeWindow] || contextChat?.posJoinMessages[lastTimeWindow]
    : contextChat?.messageGroups[lastTimeWindow]);
  ChatLogger.debug('ChatContainer::render::chatData',contextChat);
  applyPropsToState = () => {
    ChatLogger.debug('ChatContainer::applyPropsToState::chatData',lastMsg, stateLastMsg, contextChat?.syncing);
    if (
      (lastMsg?.lastTimestamp !== stateLastMsg?.lastTimestamp)
      || (previousChatId !== chatID)
      || (prevSync !== contextChat?.syncing)
      ) {
      prevSync = contextChat?.syncing;
      const timeWindowsValues = isPublicChat
        ? [
          ...(
            !contextChat?.syncing ? Object.values(contextChat?.preJoinMessages || {}) : [
              {
                id: sysMessagesIds.syncId,
                content: [{
                  id: 'synced',
                  text: intl.formatMessage(intlMessages.loading, { 0: contextChat?.syncedPercent}),
                  time: loginTime + 1,
                }],
                key: sysMessagesIds.syncId,
                time: loginTime + 1,
                sender: null,
              }
            ]
          )
          , ...systemMessagesIds.map((item) => systemMessages[item]),
        ...Object.values(contextChat?.posJoinMessages || {})]
        : [...Object.values(contextChat?.messageGroups || {})];
      if (previousChatId !== chatID) {
        previousChatId = chatID;
      }

      setLastMsg(lastMsg ? { ...lastMsg } : lastMsg);
      setTimeWindows(timeWindowsValues);
      setLastTimeWindowValuesBuild(Date.now());
    }
  }
  globalAppplyStateToProps = applyPropsToState;
  throttledFunc();

  ChatService.removePackagedClassAttribute(
    ["ReactVirtualized__Grid", "ReactVirtualized__Grid__innerScrollContainer"], 
    "role"
  );
  
  return (
    <Chat {...{
      ...props,
      chatID,
      amIModerator,
      count: (contextChat?.unreadTimeWindows.size || 0),
      timeWindowsValues: stateTimeWindows,
      dispatch: usingChatContext?.dispatch,
      title,
      syncing: contextChat?.syncing,
      syncedPercent: contextChat?.syncedPercent,
      chatName,
      contextChat,
      lastTimeWindowValuesBuild,
    }}>
      {children}
    </Chat>
  );
};

export default injectIntl(withTracker(({ intl }) => {
  const chatID = Session.get('idChatOpen');
  let isChatLocked = ChatService.isChatLocked(chatID);

  // let chatName = title;
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
    intl,
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
