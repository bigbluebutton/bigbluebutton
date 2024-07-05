import React from 'react';
import SwitchButtonComponent from './component';

const SwitchButtonContainer = props => <SwitchButtonComponent {...props} />;

export default props => (
  <SwitchButtonContainer {...props} />
);
