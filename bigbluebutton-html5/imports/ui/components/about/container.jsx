import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import AboutComponent from './component';

class AboutContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <AboutComponent {...this.props}>
        {this.props.children}
      </AboutComponent>
    );
  }
}

const getClientBuildInfo = () => {
  return {
    clientBuild: Meteor.settings.public.app.html5ClientBuild,
    copyright: Meteor.settings.public.app.copyright,
  };
};

export default createContainer(() => {
  return getClientBuildInfo();
}, AboutContainer);
