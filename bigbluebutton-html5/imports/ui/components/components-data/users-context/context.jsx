import React, {
  createContext,
  useReducer,
} from 'react';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

export const ACTIONS = {
  TEST: 'test',
  ADDED: 'added',
  CHANGED: 'changed',
  REMOVED: 'removed',
  ADDED_USER_PERSISTENT_DATA: 'added_user_persistent_data',
  CHANGED_USER_PERSISTENT_DATA: 'changed_user_persistent_data',
};

export const UsersContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TEST: {
      return {
        ...state,
        ...action.value,
      };
    }

    case ACTIONS.ADDED:
    case ACTIONS.CHANGED: {
      ChatLogger.debug('UsersContextProvider::reducer::added', { ...action });

      const { user } = action.value;

      const newState = { ...state };

      if (!newState[user.meetingId]) {
        newState[user.meetingId] = {};
      }
      newState[user.meetingId][user.userId] = {
        ...user,
      };
      return newState;
    }
    case ACTIONS.REMOVED: {
      ChatLogger.debug('UsersContextProvider::reducer::removed', { ...action });

      const { user } = action.value;
      const stateUser = state[user.meetingId][user.userId];
      if (stateUser) {
        const newState = { ...state };
        newState[user.meetingId][user.userId] = {
          ...stateUser,
          loggedOut: true,
        };

        return newState;
      }
      return state;
    }

    // USER PERSISTENT DATA
    case ACTIONS.ADDED_USER_PERSISTENT_DATA: {
      ChatLogger.debug('UsersContextProvider::reducer::added_user_persistent_data', { ...action });

      const { user } = action.value;
      if (state[user.meetingId] && state[user.meetingId][user.userId]) {
        const newState = { ...state };
        newState[user.meetingId][user.userId] = {
          ...state[user.meetingId][user.userId],
          ...user,
        };

        return newState;
      }

      const newState = { ...state };

      if (!newState[user.meetingId]) {
        newState[user.meetingId] = {};
      }
      newState[user.meetingId][user.userId] = {
        ...user,
      };
      return newState;
    }
    case ACTIONS.CHANGED_USER_PERSISTENT_DATA: {
      ChatLogger.debug('UsersContextProvider::reducer::changed_user_persistent_data', { ...action });

      const { user } = action.value;
      const stateUser = state[user.meetingId][user.userId];
      if (stateUser) {
        const newState = { ...state };
        newState[user.meetingId][user.userId] = {
          ...stateUser,
          ...user,
        };

        return newState;
      }
      return state;
    }
    default: {
      throw new Error(`Unexpected action: ${JSON.stringify(action)}`);
    }
  }
};

export const UsersContextProvider = (props) => {
  const [usersContextState, usersContextDispatch] = useReducer(reducer, {});
  ChatLogger.debug('UsersContextProvider::usersContextState', usersContextState);
  return (
    <UsersContext.Provider value={
      {
        ...props,
        dispatch: usersContextDispatch,
        users: { ...usersContextState },
      }
    }
    >
      {props.children}
    </UsersContext.Provider>
  );
};

export const UsersContextConsumer = Component => props => (
  <UsersContext.Consumer>
    {contexts => <Component {...props} {...contexts} />}
  </UsersContext.Consumer>
);

export const withUsersConsumer = Component => UsersContextConsumer(Component);

export default {
  UsersContextConsumer,
  UsersContextProvider,
};
