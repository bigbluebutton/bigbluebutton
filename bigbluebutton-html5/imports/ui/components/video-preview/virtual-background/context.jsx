import React, { useReducer } from 'react';
import _ from 'lodash';
import Service from './service';

export const CustomVirtualBackgroundsContext = React.createContext();

const reducer = (state, action) => {
  const { save, del } = Service;

  switch (action.type) {
    case 'load': {
      return {
        ...state,
        loaded: true,
        customBackgrounds: action.backgrounds,
        newCustomBackgrounds: [],
      };
    }
    case 'new': {
      save(action.background);
      return {
        ...state,
        newCustomBackgrounds: [
          ...state.newCustomBackgrounds,
          action.background,
        ],
      };
    }
    case 'delete': {
      const { customBackgrounds, newCustomBackgrounds } = state;
      const filterFunc = ({ uniqueId }) => uniqueId !== action.uniqueId;

      del(action.uniqueId);
      return {
        customBackgrounds: customBackgrounds.filter(filterFunc),
        newCustomBackgrounds: newCustomBackgrounds.filter(filterFunc),
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
    customBackgrounds: [],
    newCustomBackgrounds: [],
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
  }

  return (
    <CustomVirtualBackgroundsContext.Provider
      value={{
        dispatch,
        loaded: state.loaded,
        customBackgrounds: state.customBackgrounds,
        newCustomBackgrounds: state.newCustomBackgrounds,
        loadFromDB: _.throttle(loadFromDB, 500, { leading: true, trailing: false }),
      }}
    >
      {children}
    </CustomVirtualBackgroundsContext.Provider>
  );
}
