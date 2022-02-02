import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import AboutComponent from './component';

const AboutContainer = (props) => {
  const { children } = props;
  return (
    <AboutComponent {...props}>
      {children}
    </AboutComponent>
  );
};

const getClientBuildInfo = () => (
  {
    clientBuild: Meteor.settings.public.app.html5ClientBuild,
    copyright: Meteor.settings.public.app.copyright,
    bbbServerVersion: Meteor.settings.public.app.bbbServerVersion,
    displayBbbServerVersion: Meteor.settings.public.app.displayBbbServerVersion,
  }
);

export default withTracker(() => getClientBuildInfo())(AboutContainer);
