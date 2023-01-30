import React, { useReducer } from 'react';
import _ from 'lodash';
import Service from './service';

export const CustomVirtualBackgroundsContext = React.createContext();

const reducer = (state, action) => {
  const { save, del, update } = Service;

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
      save(action.background);
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
    case 'update': {
      if (action.background.custom) update(action.background);
      return {
        ...state,
        backgrounds: {
          ...state.backgrounds,
          [action.background.uniqueId]: action.background,
        },
      };
    }
    case 'setDefault': {
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

  const { load } = Service;

  const loadFromDB = () => {
    const onError = () => dispatch({
      type: 'load',
      backgrounds: [],
    });

    const onSuccess = (backgrounds) => dispatch({
      type: 'load',
      backgrounds,
    });

    load(onError, onSuccess);
  };

  return (
    <CustomVirtualBackgroundsContext.Provider
      value={{
        dispatch,
        loaded: state.loaded,
        defaultSetUp: state.defaultSetUp,
        backgrounds: state.backgrounds,
        loadFromDB: _.throttle(loadFromDB, 500, { leading: true, trailing: false }),
      }}
    >
      {children}
    </CustomVirtualBackgroundsContext.Provider>
  );
};
