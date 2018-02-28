import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import Service from './service';
import NavBar from './component';

const NavBarContainer = ({ children, ...props }) => (
  <NavBar {...props}>
    {children}
  </NavBar>
);

export default withRouter(withTracker(({ location, router }) => {
  let meetingTitle;
  let meetingRecorded;

  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    meetingRecorded = meetingObject.recordProp.recording;
  }

  const breakouts = Service.getBreakouts();
  const currentUserId = Auth.userID;

  return {
    breakouts,
    currentUserId,
    meetingId,
    getBreakoutJoinURL: Service.getBreakoutJoinURL,
    presentationTitle: meetingTitle,
    isBreakoutRoom: meetingIsBreakout(),
    beingRecorded: meetingRecorded,
  };
})(NavBarContainer));
