import React from 'react';
import hoist from 'hoist-non-react-statics';
import Tab from '../../../Tab';

function TabWrapper(props) {
  return <Tab {...props} />;
}

export default hoist(TabWrapper, Tab);
