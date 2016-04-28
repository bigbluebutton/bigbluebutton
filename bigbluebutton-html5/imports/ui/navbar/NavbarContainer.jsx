import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Navbar from './Navbar.jsx';

class NavbarContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
    };
  }

  render() {
    return (
      <Navbar {...this.props}>
        {this.props.children}
      </Navbar>
    );
  }
}

export default createContainer(() => {
  return {
    presentationTitle: 'My Presentation',
    hasUnreadMessages: true,
  };
}, NavbarContainer);
