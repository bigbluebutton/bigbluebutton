import { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { ChatContext, ACTIONS, MESSAGE_TYPES } from './context';
import { UsersContext } from '../users-context/context';
import { makeCall } from '/imports/ui/services/api';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import Auth from '/imports/ui/services/auth';
import CollectionEventsBroker from '/imports/ui/services/LiveDataEventBroker/LiveDataEventBroker';

let prevUserData = {};
let currentUserData = {};
let messageQueue = [];

const CHAT_CONFIG = Meteor.settings.public.chat;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const CHAT_CLEAR_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_clear;
const ITENS_PER_PAGE = CHAT_CONFIG.itemsPerPage;
const TIME_BETWEEN_FETCHS = CHAT_CONFIG.timeBetweenFetchs;
const EVENT_NAME = 'bbb-group-chat-messages-subscription-has-stoppped';
const EVENT_NAME_SUBSCRIPTION_READY = 'bbb-group-chat-messages-subscriptions-ready';

const getMessagesBeforeJoinCounter = async () => {
  const counter = await makeCall('chatMessageBeforeJoinCounter');
  return counter;
};

const startSyncMessagesbeforeJoin = async (dispatch) => {
  const chatsMessagesCount = await getMessagesBeforeJoinCounter();
  const pagesPerChat = chatsMessagesCount
    .map((chat) => ({ ...chat, pages: Math.ceil(chat.count / ITENS_PER_PAGE), syncedPages: 0 }));

  const syncRoutine = async (chatsToSync) => {
    if (!chatsToSync.length) return;

    const pagesToFetch = [...chatsToSync].sort((a, b) => a.pages - b.pages);
    const chatWithLessPages = pagesToFetch[0];
    chatWithLessPages.syncedPages += 1;
    const messagesFromPage = await makeCall('fetchMessagePerPage', chatWithLessPages.chatId, chatWithLessPages.syncedPages);

    if (messagesFromPage.length) {
      dispatch({
        type: ACTIONS.ADDED,
        value: messagesFromPage,
        messageType: MESSAGE_TYPES.HISTORY,
      });
      dispatch({
        type: ACTIONS.SYNC_STATUS,
        value: {
          chatId: chatWithLessPages.chatId,
          percentage: Math.floor((chatWithLessPages.syncedPages / chatWithLessPages.pages) * 100),
        },
      });
    }

    await new Promise((r) => setTimeout(r, TIME_BETWEEN_FETCHS));
    syncRoutine(pagesToFetch.filter((chat) => !(chat.syncedPages > chat.pages)));
  };
  syncRoutine(pagesPerChat);
};

const Adapter = () => {
  const usingChatContext = useContext(ChatContext);
  const { dispatch } = usingChatContext;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const [syncStarted, setSync] = useState(true);
  const [subscriptionReady, setSubscriptionReady] = useState(false);
  ChatLogger.trace('chatAdapter::body::users', users[Auth.meetingID]);

  useEffect(() => {
    window.addEventListener(EVENT_NAME, () => {
      /* needed to prevent an issue with dupĺicated messages when user role is changed
      more info: https://github.com/bigbluebutton/bigbluebutton/issues/11842 */
      if (prevUserData.role && prevUserData?.role !== currentUserData?.role) {
        dispatch({
          type: ACTIONS.CLEAR_STREAM_MESSAGES,
        });
      }
    });

    window.addEventListener(EVENT_NAME_SUBSCRIPTION_READY, () => {
      setSubscriptionReady(true);
    });
  }, []);

  useEffect(() => {
    const connectionStatus = Meteor.status();
    if (connectionStatus.connected && !syncStarted && Auth.userID && subscriptionReady) {
      setTimeout(() => {
        setSync(true);
        startSyncMessagesbeforeJoin(dispatch);
      }, 1000);
    }
  }, [Meteor.status().connected, syncStarted, Auth.userID, subscriptionReady]);

  /* needed to prevent an issue with dupĺicated messages when user role is changed
  more info: https://github.com/bigbluebutton/bigbluebutton/issues/11842 */
  useEffect(() => {
    if (users[Auth.meetingID]) {
      if (currentUserData?.role !== users[Auth.meetingID][Auth.userID]?.role) {
        prevUserData = currentUserData;
      }
      currentUserData = users[Auth.meetingID][Auth.userID];
    }
  }, [usingUsersContext]);

  useEffect(() => {
    if (!Meteor.status().connected) return;
    setSync(false);
    dispatch({
      type: ACTIONS.CLEAR_ALL,
    });
    const throttledDispatch = _.throttle(() => {
      const dispatchedMessageQueue = [...messageQueue];
      messageQueue = [];
      dispatch({
        type: ACTIONS.ADDED,
        value: dispatchedMessageQueue,
        messageType: MESSAGE_TYPES.STREAM,
      });
    }, 1000, { trailing: true, leading: true });

    const insertToContext = (fields) => {
      if (fields.id === `${SYSTEM_CHAT_TYPE}-${CHAT_CLEAR_MESSAGE}`) {
        messageQueue = [];
        dispatch({
          type: ACTIONS.REMOVED,
        });
      }

      messageQueue.push(fields);
      throttledDispatch();
    };

    CollectionEventsBroker.addListener('group-chat-msg', 'added', insertToContext);
  }, [Meteor.status().connected, Meteor.connection._lastSessionId]);

  return null;
};

export default Adapter;
