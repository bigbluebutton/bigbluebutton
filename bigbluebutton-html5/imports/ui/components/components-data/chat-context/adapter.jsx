import { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { ChatContext, ACTIONS } from './context';
import { UsersContext } from '../users-context/context';
import { makeCall } from '/imports/ui/services/api';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import Auth from '/imports/ui/services/auth';

let usersData = {};
let messageQueue = [];

const CHAT_CONFIG = Meteor.settings.public.chat;
const ITENS_PER_PAGE = CHAT_CONFIG.itemsPerPage;
const TIME_BETWEEN_FETCHS = CHAT_CONFIG.timeBetweenFetchs;

const getMessagesBeforeJoinCounter = async () => {
  const counter = await makeCall('chatMessageBeforeJoinCounter');
  return counter;
};

const startSyncMessagesbeforeJoin = async (dispatch) => {
  const chatsMessagesCount = await getMessagesBeforeJoinCounter();
  const pagesPerChat = chatsMessagesCount.map(chat => ({ ...chat, pages: Math.ceil(chat.count / ITENS_PER_PAGE), syncedPages: 0 }));

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
      });
      dispatch({
        type: ACTIONS.SYNC_STATUS,
        value: {
          chatId: chatWithLessPages.chatId,
          percentage: Math.floor((chatWithLessPages.syncedPages / chatWithLessPages.pages) * 100),
        },
      });
    }


    await new Promise(r => setTimeout(r, TIME_BETWEEN_FETCHS));
    syncRoutine(pagesToFetch.filter(chat => !(chat.syncedPages > chat.pages)));
  };
  syncRoutine(pagesPerChat);
};

const Adapter = () => {
  const usingChatContext = useContext(ChatContext);
  const { dispatch } = usingChatContext;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const [syncStarted, setSync] = useState(true);
  ChatLogger.trace('chatAdapter::body::users', users);

  useEffect(() => {
    const connectionStatus = Meteor.status();
    if (connectionStatus.connected && !syncStarted && Auth.userID) {
      setSync(true);

      startSyncMessagesbeforeJoin(dispatch);
    }
  }, [Meteor.status().connected, syncStarted, Auth.userID]);


  useEffect(() => {
    usersData = users;
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
      });
    }, 1000, { trailing: true, leading: true });

    Meteor.connection._stream.socket.addEventListener('message', (msg) => {
      if (msg.data.indexOf('{"msg":"added","collection":"group-chat-msg"') != -1) {
        const parsedMsg = JSON.parse(msg.data);
        if (parsedMsg.msg === 'added') {
          messageQueue.push(parsedMsg.fields);
          throttledDispatch();
        }
      }
      if (msg.data.indexOf('{"msg":"removed","collection":"group-chat-msg"') != -1) {
        messageQueue = [];
        dispatch({
          type: ACTIONS.REMOVED,
        });
      }
    });
  }, [Meteor.status().connected, Meteor.connection._lastSessionId]);

  return null;
};

export default Adapter;
