import { useContext, useEffect } from 'react';
import { CurrentUser } from '/imports/api/users';
import Users from '/imports/api/users';
import { UsersContext, ACTIONS } from './context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

const Adapter = () => {
  const usingUsersContext = useContext(UsersContext);
  const { dispatch } = usingUsersContext;

  useEffect(() => {
    const usersCursor = Users.find({}, { sort: { timestamp: 1 } });
    const CurrentUserCursor = CurrentUser.find({});
    usersCursor.observe({
      added: (obj) => {
        ChatLogger.debug('usersAdapter::observe::added', obj);
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
    });

    CurrentUserCursor.observe({
      added: (obj) => {
        ChatLogger.debug('usersAdapter::observe::current-user::added', obj);
        dispatch({
          type: ACTIONS.ADDED,
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
