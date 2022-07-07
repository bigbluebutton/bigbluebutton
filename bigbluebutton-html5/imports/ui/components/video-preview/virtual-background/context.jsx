import React, { useReducer } from 'react';
import _ from 'lodash';
import Service from './service';

export const CustomVirtualBackgroundsContext = React.createContext();

const reducer = (state, action) => {
  const { save, del } = Service;

  switch (action.type) {
    case 'load': {
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
    case 'new': {
      if (action.background.custom) save(action.background);
      return {
        ...state,
        backgrounds: {
          ...state.backgrounds,
          [action.background.uniqueId]: action.background,
        },
      };
    }
    case 'delete': {
      const { backgrounds } = state;
      delete backgrounds[action.uniqueId];
      del(action.uniqueId);

      return {
        ...state,
        backgrounds,
      };
    }
    default: {
      throw new Error('Unknown custom background action.');
    }
  }
}

export const CustomBackgroundsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    loaded: false,
    backgrounds: {},
  });

  const { load } = Service;

  const loadFromDB = () => {
    const onError = () => dispatch({
      type: 'load',
      backgrounds: {},
    });

    const onSuccess = (backgrounds) => dispatch({
      type: 'load',
      backgrounds,
    });

    load(onError, onSuccess);
  }

  return (
    <CustomVirtualBackgroundsContext.Provider
      value={{
        dispatch,
        loaded: state.loaded,
        backgrounds: state.backgrounds,
        loadFromDB: _.throttle(loadFromDB, 500, { leading: true, trailing: false }),
      }}
    >
      {children}
    </CustomVirtualBackgroundsContext.Provider>
  );
}
