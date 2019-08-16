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
const JoinLoading = Component => (props) => {
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


const withJoinLoadingConsumer = Component => joinLoadingContextConsumer(Component);

const withJoinLoadingContext = Component => JoinLoading(withJoinLoadingConsumer(Component));

export {
  withJoinLoadingContext,
  withJoinLoadingConsumer,
  joinLoadingContextConsumer,
  JoinLoading,
  reducer,
  initialState,
  JoinLoadingContext,
};
