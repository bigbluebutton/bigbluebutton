import React, { createContext, useReducer } from 'react';

export const ACTIONS = {
  SET_LOADING: 'set_loading',
  SET_HAS_ERROR: 'set_has_error',
};

const initState = {
  isLoading: true,
  hasError: false,
};

export const JoinContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING: {
      const { isLoading } = state;
      if (isLoading === action.value) {
        return state;
      }
      return {
        ...state,
        isLoading: action.value,
      };
    }
    case ACTIONS.SET_HAS_ERROR: {
      const { hasError } = state;
      if (hasError === action.value) {
        return state;
      }
      return {
        ...state,
        hasError: action.value,
      };
    }

    default: {
      throw new Error(`Unexpected action: ${JSON.stringify(action)}`);
    }
  }
};

export const JoinContextProvider = (props) => {
  const [joinContextState, joinContextDispatch] = useReducer(reducer, initState);
  const { children } = props;

  return (
    <JoinContext.Provider value={
      {
        ...props,
        joinDispatch: joinContextDispatch,
        joinState: { ...joinContextState },
      }
    }
    >
      {children}
    </JoinContext.Provider>
  );
};

export const JoinContextConsumer = (Component) => (props) => (
  <JoinContext.Consumer>
    {(contexts) => <Component {...props} {...contexts} />}
  </JoinContext.Consumer>
);

export const JOIN_ACTIONS = ACTIONS;

export default {
  JoinContextConsumer,
  JoinContextProvider,
};
