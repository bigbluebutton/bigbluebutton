import React, { useMemo, useContext, useEffect } from 'react';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import { ChatContext, ACTIONS } from './context';


const Adapter = () => {
  const usingChatContext = useContext(ChatContext);
  const { dispatch } = usingChatContext;
  useEffect(() => {
    console.log('adapter carregou\n\n\n\n');
    const chatCursor = GroupChatMsg.find({}, { sort: { timestamp: 1 } });
    chatCursor.observe({
      added: (obj) => {
        console.log('testando som', obj);
        dispatch({
          type: ACTIONS.ADDED,
          value: {
            msg: obj,
          },
        });
      },
      changed: (obj) => {
        dispatch({
          type: ACTIONS.CHANGED,
          value: {
            msg: obj,
          },
        });
      },
      removed: (obj) => {
        dispatch({
          type: ACTIONS.REMOVED,
          value: {
            msg: obj,
          },
        });
      },
    });
  }, []);

  return null;
};

export default Adapter;
