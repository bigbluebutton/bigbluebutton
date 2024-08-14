import React, { useEffect, useReducer } from 'react';
import { v4 as uuid } from 'uuid';
import { throttle } from '/imports/utils/throttle';
import Service from './service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import logger from '/imports/startup/client/logger';
import { EFFECT_TYPES } from '/imports/ui/services/virtual-background/service';

export const CustomVirtualBackgroundsContext = React.createContext();

export const ACTIONS = {
  LOAD: 'load',
  NEW: 'new',
  DELETE: 'delete',
  UPDATE: 'update',
  SET_DEFAULT: 'setDefault',
};

const reducer = (state, action) => {
  const { save, del, update } = Service;

  switch (action.type) {
    case ACTIONS.LOAD: {
      const backgrounds = { ...state.backgrounds };
      action.backgrounds.forEach((background) => {
        backgrounds[background.uniqueId] = background;
      });
      return {
        ...state,
        loaded: true,
        backgrounds,
      };
    }
    case ACTIONS.NEW: {
      const { backgrounds } = state;
      const { background } = action;
      const { uniqueId = uuid() } = background;
      if (background.custom && !background.sessionOnly) save(background);
      return {
        ...state,
        backgrounds: {
          ...backgrounds,
          [uniqueId]: background,
        },
      };
    }
    case ACTIONS.DELETE: {
      const { backgrounds } = state;
      delete backgrounds[action.uniqueId];
      del(action.uniqueId);
      return {
        ...state,
        backgrounds,
      };
    }
    case ACTIONS.UPDATE: {
      const { backgrounds } = state;
      const { background } = action;
      const { uniqueId } = background;
      if (!uniqueId) return state;
      const updatedBackground = {
        ...(backgrounds[uniqueId] || {}),
        ...background,
      };
      if (updatedBackground.custom && !updatedBackground.sessionOnly) update(updatedBackground);
      return {
        ...state,
        backgrounds: {
          ...backgrounds,
          [uniqueId]: updatedBackground,
        },
      };
    }
    case ACTIONS.SET_DEFAULT: {
      const backgrounds = { ...state.backgrounds };
      action.backgrounds.forEach((background) => {
        backgrounds[background.uniqueId] = background;
      });
      return {
        ...state,
        defaultSetUp: true,
        backgrounds,
      };
    }
    default: {
      throw new Error('Unknown custom background action.');
    }
  }
};

export const CustomBackgroundsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    loaded: false,
    defaultSetUp: false,
    backgrounds: {},
  });
  const { data: currentUser, loading: isCurrentUserLoading } = useCurrentUser((u) => ({
    webcamBackground: u.webcamBackground,
  }));

  const { load } = Service;

  const loadFromDB = () => {
    const onError = () => dispatch({
      type: ACTIONS.LOAD,
      backgrounds: [],
    });

    const onSuccess = (backgrounds) => dispatch({
      type: ACTIONS.LOAD,
      backgrounds,
    });

    load(onError, onSuccess);
  };

  useEffect(() => {
    if (!isCurrentUserLoading && currentUser && !state.backgrounds.webcamBackgroundURL) {
      const webcamBackgroundURL = currentUser.webcamBackground;
      if (webcamBackgroundURL !== '' && !state.backgrounds.webcamBackgroundURL) {
        Service.getFileFromUrl(webcamBackgroundURL)
          .then((fetchedWebcamBackground) => {
            if (fetchedWebcamBackground) {
              const data = URL.createObjectURL(fetchedWebcamBackground);
              const uniqueId = 'webcamBackgroundURL';
              const filename = webcamBackgroundURL;
              dispatch({
                type: ACTIONS.UPDATE,
                background: {
                  filename,
                  uniqueId,
                  data,
                  lastActivityDate: Date.now(),
                  custom: true,
                  sessionOnly: true,
                  type: EFFECT_TYPES.IMAGE_TYPE,
                },
              });
            } else {
              logger.error({
                logCode: 'webcam_background_fetch_error',
              }, 'Failed to fetch custom webcam background image.');
            }
          });
      }
    }
  }, [isCurrentUserLoading, currentUser]);

  return (
    <CustomVirtualBackgroundsContext.Provider
      value={{
        dispatch,
        loaded: state.loaded,
        defaultSetUp: state.defaultSetUp,
        backgrounds: state.backgrounds,
        loadFromDB: throttle(loadFromDB, 500, { leading: true, trailing: false }),
      }}
    >
      {children}
    </CustomVirtualBackgroundsContext.Provider>
  );
};
