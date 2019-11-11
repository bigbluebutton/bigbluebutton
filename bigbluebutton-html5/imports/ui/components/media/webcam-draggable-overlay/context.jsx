import React, { createContext, useReducer, useEffect } from 'react';
import Storage from '../../../services/storage/session';

export const WebcamDraggableContext = createContext();

const initialState = {
  placement: 'top',
  mediaSize: {
    width: 0,
    height: 0,
  },
  videoListSize: {
    width: 0,
    height: 0,
  },
  initialRef: {
    x: 0,
    y: 0,
  },
  tempPosition: {
    x: 0,
    y: 0,
  },
  lastPosition: {
    x: 0,
    y: 0,
  },
  dragging: false,
  videoRef: null,
  videoListRef: null,
  isCameraFullscreen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setplacementToTop': {
      return {
        ...state,
        placement: 'top',
      };
    }
    case 'setplacementToBottom': {
      return {
        ...state,
        placement: 'bottom',
      };
    }
    case 'setplacementToFloating': {
      return {
        ...state,
        placement: 'floating',
      };
    }
    case 'setMediaSize': {
      return {
        ...state,
        mediaSize: {
          width: action.value.width,
          height: action.value.height,
        },
      };
    }
    case 'setVideoListSize': {
      return {
        ...state,
        videoListSize: {
          width: action.value.width,
          height: action.value.height,
        },
      };
    }
    case 'setWebcamRef': {
      return {
        ...state,
        webcamRef: action.value,
      };
    }
    case 'setInitialRef': {
      return {
        ...state,
        initialRef: {
          x: action.value.x,
          y: action.value.y,
        },
      };
    }
    case 'setTempPosition': {
      return {
        ...state,
        tempPosition: {
          x: action.value.x,
          y: action.value.y,
        },
      };
    }
    case 'setLastPosition': {
      return {
        ...state,
        lastPosition: {
          x: action.value.x,
          y: action.value.y,
        },
      };
    }
    case 'setVideoRef': {
      return {
        ...state,
        videoRef: action.value,
      };
    }
    case 'setVideoListRef': {
      return {
        ...state,
        videoListRef: action.value,
      };
    }
    case 'dragStart': {
      return {
        ...state,
        dragging: true,
      };
    }
    case 'dragEnd': {
      return {
        ...state,
        dragging: false,
      };
    }
    case 'setIsCameraFullscreen': {
      return {
        ...state,
        isCameraFullscreen: action.value,
      };
    }
    default: {
      throw new Error('Unexpected action');
    }
  }
};

const ContextConsumer = Component => props => (
  <WebcamDraggableContext.Consumer>
    {contexts => <Component {...props} {...contexts} />}
  </WebcamDraggableContext.Consumer>
);

const ContextProvider = (props) => {
  const [webcamDraggableState, webcamDraggableDispatch] = useReducer(reducer, initialState);
  const { placement, lastPosition } = webcamDraggableState;
  const { children } = props;
  useEffect(() => {
    Storage.setItem('webcamPlacement', placement);
    Storage.setItem('webcamLastPosition', lastPosition);
  }, [
    placement,
    lastPosition,
  ]);

  return (
    <WebcamDraggableContext.Provider value={{
      webcamDraggableState,
      webcamDraggableDispatch,
      ...props,
    }}
    >
      {children}
    </WebcamDraggableContext.Provider>
  );
};

const withProvider = Component => props => (
  <ContextProvider {...props}>
    <Component />
  </ContextProvider>
);

const withDraggableConsumer = Component => ContextConsumer(Component);

const withDraggableContext = Component => withProvider(withDraggableConsumer(Component));

export {
  withProvider,
  withDraggableConsumer,
  withDraggableContext,
};
