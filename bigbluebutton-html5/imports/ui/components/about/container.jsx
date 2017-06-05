import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

const getClientBuildInfo = function () {
  return {
    clientBuild: Meteor.settings.public.app.html5ClientBuild,
    copyright: Meteor.settings.public.app.copyright,
  };
};

export default createContainer(() => getClientBuildInfo(), AboutContainer);
