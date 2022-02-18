import { useContext, useEffect } from 'react';
import Users, { CurrentUser } from '/imports/api/users';

import UsersPersistentData from '/imports/api/users-persistent-data';
import { UsersContext, ACTIONS } from './context';
import { UsersReadyContext, READY_ACTIONS } from '../users-ready-context/context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

const USER_JOIN_TIMEOUT = 1000;

const Adapter = () => {
  const usingUsersContext = useContext(UsersContext);
  const { dispatch } = usingUsersContext;

  const usingUsersReadyContext = useContext(UsersReadyContext);
  const { dispatch: dispatchReady } = usingUsersReadyContext;

  let readyTimeout = null;

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
      removed: () => {},
    });
  }, []);

  useEffect(() => {
    const usersCursor = Users.find({}, { sort: { timestamp: 1 } });
    const CurrentUserCursor = CurrentUser.find({});
    usersCursor.observe({
      added: (obj) => {
        ChatLogger.debug('usersAdapter::observe::added', obj);
        clearTimeout(readyTimeout);

        dispatchReady({
          type: READY_ACTIONS.READY,
          value: {
            isReady: false,
          },
        });

        dispatch({
          type: ACTIONS.ADDED,
          value: {
            user: obj,
          },
        });

        readyTimeout = setTimeout(() => {
          dispatchReady({
            type: READY_ACTIONS.READY,
            value: {
              isReady: true,
            },
          });
        }, USER_JOIN_TIMEOUT);
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
