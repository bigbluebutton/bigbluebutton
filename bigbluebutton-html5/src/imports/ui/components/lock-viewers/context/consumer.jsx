import React from 'react';
import lockContext from './context';


const contextConsumer = Component => props => (
  <lockContext.Consumer>
    { contexts => <Component {...props} {...contexts} />}
  </lockContext.Consumer>
);

export default contextConsumer;
