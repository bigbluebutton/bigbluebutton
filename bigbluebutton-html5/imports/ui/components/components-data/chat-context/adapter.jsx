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
    // TODO: hadle removed Messages
    // TODO: listen to websocket message to avoid full list comparsion
    Meteor.connection._stream.socket.addEventListener('message', (msg) => {
      if (msg.data.indexOf('{"msg":"added","collection":"group-chat-msg"') != -1) {
        const parsedMsg = JSON.parse(msg.data);
        if (parsedMsg.msg === 'added') {
          setTimeout(() => {
            dispatch({
              type: ACTIONS.ADDED,
              value: {
                msg: parsedMsg.fields,
                senderData: usersData[parsedMsg.fields.sender.id],
              },
            });
          }, 0);
        }
      }
    });
    // const diffAndDispatch = () => {
    //   setTimeout(() => {

        


    //     // const chatCursor = GroupChatMsg.find({}, { reactive: false, sort: { timestamp: 1 } }).fetch();
    //     // const notDispatched = chatCursor.filter(objMsg => !alreadyDispatched.has(objMsg._id));
    //     // notDispatched.forEach((msg) => {
    //     //   console.log('dispatch');
    //     //   dispatch({
    //     //     type: ACTIONS.ADDED,
    //     //     value: {
    //     //       msg,
    //     //       senderData: usersData[msg.sender.id],
    //     //     },
    //     //   });
    //     //   alreadyDispatched.add(msg._id);
    //     // });
    //     // diffAndDispatch();
    //   }, 500);
    // };
    // diffAndDispatch();
  }, []);

  return null;
};

export default Adapter;
