import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import NavBar from './component';

class NavBarContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <NavBar {...this.props}>
        {this.props.children}
      </NavBar>
    );
  }
}

export default createContainer(() => {
  let data = {
    presentationTitle: 'IMDT 1004 Design Process',
    hasUnreadMessages: true,
  };
  return data;
}, NavBarContainer);
