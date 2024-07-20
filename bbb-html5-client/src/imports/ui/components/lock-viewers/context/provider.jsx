import React from 'react';
import lockContext from './context';


const contextProvider = props => (
  <lockContext.Provider value={props}>
    { props.children }
  </lockContext.Provider>
);

export default contextProvider;
