import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import AboutComponent from './component';

const AboutContainer = props => (
  <AboutComponent {...props}>
    {props.children}
  </AboutComponent>
);

const getClientBuildInfo = function () {
  return {
    clientBuild: "Fairblue  21022021",
    copyright: "LGPL",
  };
};

export default withTracker(() => getClientBuildInfo())(AboutContainer);
