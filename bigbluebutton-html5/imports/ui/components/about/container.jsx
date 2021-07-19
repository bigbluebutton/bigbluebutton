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
    clientBuild: Meteor.settings.public.app.html5ClientBuild,
    serverVers: Meteor.settings.public.app.bbbServerVersion,
    copyright: Meteor.settings.public.app.copyright,
  };
};

export default withTracker(() => getClientBuildInfo())(AboutContainer);
