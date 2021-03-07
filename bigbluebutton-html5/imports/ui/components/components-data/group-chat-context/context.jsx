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

export const GroupChatContext = createContext();

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
      ChatLogger.debug('GroupChatContextProvider::reducer::added', { ...action });
      const { groupChat } = action.value;

      const newState = {
        ...state,
        [groupChat.chatId]: {
          ...groupChat,
        },
      };
      return newState;
    }

    case ACTIONS.REMOVED: {
      ChatLogger.debug('GroupChatContextProvider::reducer::removed', { ...action });

      return state;
    }
    default: {
      throw new Error(`Unexpected action: ${JSON.stringify(action)}`);
    }
  }
};

export const GroupChatContextProvider = (props) => {
  const [groupChatContextState, groupChatContextDispatch] = useReducer(reducer, {});
  ChatLogger.debug('UsersContextProvider::groupChatContextState', groupChatContextState);
  return (
    <GroupChatContext.Provider value={
      {
        ...props,
        dispatch: groupChatContextDispatch,
        groupChat: { ...groupChatContextState },
      }
    }
    >
      {props.children}
    </GroupChatContext.Provider>
  );
};

export const GroupChatContextConsumer = Component => props => (
  <GroupChatContext.Consumer>
    {contexts => <Component {...props} {...contexts} />}
  </GroupChatContext.Consumer>
);

export default {
  GroupChatContextConsumer,
  GroupChatContextProvider,
};
