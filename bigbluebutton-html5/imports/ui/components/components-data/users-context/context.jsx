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

      const newState = {
        ...state,
        [user.userId]: {
          ...user,
        },
      };
      return newState;
    }
    case ACTIONS.REMOVED: {
      ChatLogger.debug('UsersContextProvider::reducer::removed', { ...action });
      
      const { user } = action.value;
      if (state[user.userId]) {
        const newState = { ...state };
        delete newState[user.userId];
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

export default {
  UsersContextConsumer,
  UsersContextProvider,
};

