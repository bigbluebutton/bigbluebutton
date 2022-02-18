import React, {
  createContext,
  useReducer,
} from 'react';

export const READY_ACTIONS = {
  READY: 'ready',
};

export const UsersReadyContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case READY_ACTIONS.READY: {
      if (state.isReady === action.value.isReady) return state;

      return {
        ...state,
        ...action.value,
      };
    }
    default: {
      throw new Error(`Unexpected action: ${JSON.stringify(action)}`);
    }
  }
};

export const UsersReadyContextProvider = (props) => {
  const [usersReadyContextState, usersReadyContextDispatch] = useReducer(reducer, {});

  const { isReady } = usersReadyContextState;

  return (
    <UsersReadyContext.Provider value={
      {
        ...props,
        dispatch: usersReadyContextDispatch,
        isReady,
      }
    }
    >
      {props.children}
    </UsersReadyContext.Provider>
  );
};

export const UsersReadyContextConsumer = Component => props => (
  <UsersReadyContext.Consumer>
    {contexts => <Component {...props} {...contexts} />}
  </UsersReadyContext.Consumer>
);

export const withUsersReadyConsumer = Component => UsersReadyContextConsumer(Component);

export default {
  UsersReadyContextConsumer,
  UsersReadyContextProvider,
};
