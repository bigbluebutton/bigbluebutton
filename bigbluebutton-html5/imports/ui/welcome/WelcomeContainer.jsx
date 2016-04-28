import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Welcome from './Welcome.jsx';

class WelcomeContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Welcome {...this.props}>
        {this.props.children}
      </Welcome>
    );
  }
}

export default createContainer(() => {
  return {};
}, WelcomeContainer);
