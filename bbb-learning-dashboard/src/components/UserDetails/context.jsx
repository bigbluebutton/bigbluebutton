import React, { useReducer } from 'react';

export const UserDetailsContext = React.createContext();

export const UserDetailsProvider = ({ children }) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case 'changeUser':
        return {
          user: action.user,
          isOpen: true,
        };
      case 'closeModal':
        return {
          user: null,
          isOpen: false,
        };
      default:
        throw new Error();
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    user: null,
    isOpen: false,
  });

  return (
    <UserDetailsContext.Provider
      value={{
        user: state.user,
        isOpen: state.isOpen,
        dispatch,
      }}
    >
      { children }
    </UserDetailsContext.Provider>
  );
};
