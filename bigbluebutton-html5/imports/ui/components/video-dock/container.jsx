import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import VideoDock from './component';

const VideoDockContainer = props => (
  <VideoDock>
    {props.children}
  </VideoDock>
);

export default createContainer(() => {
  const data = {};
  return data;
}, VideoDockContainer);
