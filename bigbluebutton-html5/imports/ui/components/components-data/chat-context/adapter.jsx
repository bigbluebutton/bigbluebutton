import React, { useMemo, useContext, useEffect } from 'react';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import { ChatContext, ACTIONS } from './context';
import { UsersContext } from '../users-context/context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

let usersData = {};

const Adapter = () => {
  const usingChatContext = useContext(ChatContext);
  const { dispatch } = usingChatContext;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  ChatLogger.trace('chatAdapter::body::users', users);
  useEffect(() => {
    usersData = users;
  }, [usingUsersContext]);

  useEffect(() => {
    const alreadyDispatched = new Set();
    const notDispatchedCount = { count: 100 };
    // TODO: hadle removed Messages
    // TODO: listen to websocket message to avoid full list comparsion
    const diffAndDispatch = () => {
      setTimeout(() => {
        const chatCursor = GroupChatMsg.find({}, { reactive: false, sort: { timestamp: 1 } }).fetch();
        const notDispatched = chatCursor.filter(objMsg => !alreadyDispatched.has(objMsg._id));
        notDispatchedCount.count = notDispatched.length;
        
        notDispatched.forEach((msg) => {
          dispatch({
            type: ACTIONS.ADDED,
            value: {
              msg,
              senderData: usersData[msg.sender.id],
            },
          });
          alreadyDispatched.add(msg._id);
        });
        diffAndDispatch();
      }, notDispatchedCount.count >= 10 ? 1000 : 500);
    };
    diffAndDispatch();
  }, []);

  return null;
};

export default Adapter;
