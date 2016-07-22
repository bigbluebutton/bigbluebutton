import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
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
  let meetingTitle;
  let meetingRecorded;

  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId: meetingId,
  });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingName;
    meetingRecorded = meetingObject.currentlyBeingRecorded;
  }

  let data = {
    presentationTitle: meetingTitle,
    hasUnreadMessages: true,
    beingRecorded: meetingRecorded,
  };
  return data;
}, NavBarContainer);
