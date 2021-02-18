import { useContext, useEffect } from 'react';
import Users from '/imports/api/users';
import { UsersContext, ACTIONS } from './context';
import { ChatContext, ACTIONS as CHAT_ACTIONS } from '../chat-context/context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

const Adapter = () => {
  const usingUsersContext = useContext(UsersContext);
  const { dispatch } = usingUsersContext;

  const usingChatContext = useContext(ChatContext);
  const { dispatch: chatDispatch } = usingChatContext;

  useEffect(() => {
    const usersCursor = Users.find({}, { sort: { timestamp: 1 } });
    usersCursor.observe({
      added: (obj) => {
        ChatLogger.debug("usersAdapter::observe::added", obj);
        dispatch({
          type: ACTIONS.ADDED,
          value: {
            user: obj,
          },
        });
      },
      changed: (obj) => {
        dispatch({
          type: ACTIONS.CHANGED,
          value: {
            user: obj,
          },
        });
      },
      removed: (obj) => {
        dispatch({
          type: ACTIONS.REMOVED,
          value: {
            user: obj,
          },
        });
      },
    });
  }, []);

  return null;
};

export default Adapter;
