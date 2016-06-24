import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';

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

  let meetingTitle = Meetings.find().map(meeting => meeting.meetingName);

  return {
    presentationTitle: meetingTitle.toString(),
    hasUnreadMessages: true,
  };
}, NavBarContainer);
