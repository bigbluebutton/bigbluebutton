import React from 'react';
import lockContext from './context';


const contextProvider = Component => props => (
  <lockContext.Consumer>
    { contexts => <Component {...props} {...contexts} />}
  </lockContext.Consumer>
);

export default contextProvider;
