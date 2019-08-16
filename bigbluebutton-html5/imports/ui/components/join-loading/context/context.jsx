import React, { useReducer, createContext } from 'react';

function reducer(state, action) {
  switch (action) {
    case 'showLoading':
      return {
        ...state,
        showLoading: true,
      };
    case 'hideLoading':
      return {
        ...state,
        showLoading: false,
      };
    case 'hasError':
      return {
        ...state,
        hasError: true,
      };
    default:
      throw new Error();
  }
}

const JoinLoadingContext = createContext({});
const initialState = {
  showLoading: true,
  hasError: false,
};
const withProvider = Component => (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const contextValue = {
    ...props,
    ...state,
    dispatch,
  };

  return (
    <JoinLoadingContext.Provider value={contextValue}>
      <Component />
    </JoinLoadingContext.Provider>
  );
};

const joinLoadingContextConsumer = Component => props => (
  <JoinLoadingContext.Consumer>
    { contexts => <Component {...contexts} {...props} />}
  </JoinLoadingContext.Consumer>
);


const withConsumer = Component => joinLoadingContextConsumer(Component);

const withJoinLoadingContext = Component => withProvider(withConsumer(Component));

export {
  withJoinLoadingContext,
  withConsumer,
  joinLoadingContextConsumer,
  withProvider,
  reducer,
  initialState,
  JoinLoadingContext,
};
