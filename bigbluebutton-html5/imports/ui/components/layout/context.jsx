import React, { createContext, useReducer, useEffect } from 'react';

const LayoutContext = createContext();

const initialState = {
  userListSize: {
    width: 0,
  },
  chatSize: {
    width: 0,
  },
  webcamsAreaSize: {
    width: 0,
    height: 0,
  },
  presentationAreaSize: {
    width: 0,
    height: 0,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setUserListSize': {
      return {
        ...state,
        userListSize: {
          width: action.value.width,
        },
      };
    }
    case 'setChatSize': {
      return {
        ...state,
        chatSize: {
          width: action.value.width,
        },
      };
    }
    case 'setWebcamsAreaSize': {
      return {
        ...state,
        webcamsAreaSize: {
          width: action.value.width,
          height: action.value.height,
        },
      };
    }
    case 'setPresentationAreaSize': {
      return {
        ...state,
        presentationAreaSize: {
          width: action.value.width,
          height: action.value.height,
        },
      };
    }
    default: {
      throw new Error('Unexpected action');
    }
  }
};

const ContextProvider = (props) => {
  const [layoutContextState, layoutContextDispatch] = useReducer(reducer, initialState);
  const { children } = props;

  useEffect(() => {
  });

  return (
    <LayoutContext.Provider value={{
      layoutContextState,
      layoutContextDispatch,
      ...props,
    }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

const withProvider = Component => props => (
  <ContextProvider {...props}>
    <Component />
  </ContextProvider>
);

const ContextConsumer = Component => props => (
  <LayoutContext.Consumer>
    {contexts => <Component {...props} {...contexts} />}
  </LayoutContext.Consumer>
);

const withLayoutConsumer = Component => ContextConsumer(Component);
const withLayoutContext = Component => withProvider(withLayoutConsumer(Component));

export default {
  LayoutContext,
};

export {
  withLayoutConsumer,
  withLayoutContext,
};
