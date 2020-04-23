import React, { createContext, useReducer, useEffect } from 'react';
import Storage from '/imports/ui/services/storage/session';

const { webcamsDefaultPlacement } = Meteor.settings.public.layout;

export const LayoutContext = createContext();

const initialState = {
  autoArrangeLayout: true,
  windowSize: {
    width: 0,
    height: 0,
  },
  mediaBounds: {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  },
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
  percentWebcamsAreaUserSets: {
    width: 0,
    height: 0,
  },
  webcamsPlacement: webcamsDefaultPlacement || 'top',
  presentationAreaSize: {
    width: 0,
    height: 0,
  },
  presentationIsFullscreen: null,
  presentationOrientation: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setAutoArrangeLayout': {
      return {
        ...state,
        autoArrangeLayout: action.value,
      };
    }
    case 'setWindowSize': {
      return {
        ...state,
        windowSize: {
          width: action.value.width,
          height: action.value.height,
        },
      };
    }
    case 'setMediaBounds': {
      return {
        ...state,
        mediaBounds: {
          width: action.value.width,
          height: action.value.height,
          top: action.value.top,
          left: action.value.left,
        },
      };
    }
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
    case 'setWebcamsPlacement': {
      // webcamsPlacement: ('top' | 'right' | 'bottom' | 'left') string
      return {
        ...state,
        webcamsPlacement: action.value,
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
    case 'setPercentWebcamsAreaUserSets': {
      return {
        ...state,
        percentWebcamsAreaUserSets: {
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
    case 'setPresentationFullscreen': {
      // presentationIsFullscreen: (true | false) boolean
      return {
        ...state,
        presentationIsFullscreen: action.value,
      };
    }
    case 'setPresentationOrientation': {
      // presentationOrientation: ('portrait' | 'landscape') string
      return {
        ...state,
        presentationOrientation: action.value,
      };
    }
    default: {
      throw new Error('Unexpected action');
    }
  }
};

const ContextProvider = (props) => {
  const [layoutContextState, layoutContextDispatch] = useReducer(reducer, initialState);
  const { webcamsPlacement, autoArrangeLayout } = layoutContextState;
  const { children } = props;

  useEffect(() => {
    Storage.setItem('webcamsPlacement', webcamsPlacement);
    Storage.setItem('autoArrangeLayout', autoArrangeLayout);
  }, [
    webcamsPlacement,
    autoArrangeLayout,
  ]);

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

export {
  withProvider,
  withLayoutConsumer,
  withLayoutContext,
};
