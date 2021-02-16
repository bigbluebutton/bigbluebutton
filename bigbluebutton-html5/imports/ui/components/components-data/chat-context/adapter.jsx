import { useContext, useEffect } from 'react';
import _ from 'lodash';
import { ChatContext, ACTIONS } from './context';
import { UsersContext } from '../users-context/context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

let usersData = {};
let messageQueue = [];
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
    // TODO: listen to websocket message to avoid full list comparsion
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
          messageQueue.push({
            msg: parsedMsg.fields,
            senderData: usersData[parsedMsg.fields.sender.id],
          });
          throttledDispatch();
        }
      }
      if (msg.data.indexOf('{"msg":"removed","collection":"group-chat-msg"') != -1) {
        dispatch({
          type: ACTIONS.REMOVED,
        });
      }
    });
  }, []);

  return null;
};

export default Adapter;
