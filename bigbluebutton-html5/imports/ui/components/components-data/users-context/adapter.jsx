import { useContext, useEffect } from 'react';
import { CurrentUser } from '/imports/api/users';
import Users from '/imports/api/users';
import UsersPersistentData from '/imports/api/users-persistent-data';
import { UsersContext, ACTIONS } from './context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

const Adapter = () => {
  const usingUsersContext = useContext(UsersContext);
  const { dispatch } = usingUsersContext;

  useEffect(() => {
    const usersPersistentDataCursor = UsersPersistentData.find({}, { sort: { timestamp: 1 } });
    usersPersistentDataCursor.observe({
      added: (obj) => {
        ChatLogger.debug('usersAdapter::observe::added_persistent_user', obj);
        dispatch({
          type: ACTIONS.ADDED_USER_PERSISTENT_DATA,
          value: {
            user: obj,
          },
        });
      },
      changed: (obj) => {
        ChatLogger.debug('usersAdapter::observe::changed_persistent_user', obj);
        dispatch({
          type: ACTIONS.CHANGED_USER_PERSISTENT_DATA,
          value: {
            user: obj,
          },
        });
      },
      removed: (obj) => {
        ChatLogger.debug('usersAdapter::observe::removed', obj);
        dispatch({
          type: ACTIONS.REMOVED,
          value: {
            user: obj,
          },
        });
      },
    });
  }, []);

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
        ChatLogger.debug('usersAdapter::observe::changed', obj);
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
