import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { withModalMounter } from '../modal/service';
import Service from '../actions-bar/service';

import Header from './Header';

const HeaderContainer = props => (
  <Header {...props} />
);

export default withModalMounter(withTracker(() => ({
  amIModerator: Service.amIModerator(),
  isMeteorConnected: Meteor.status().connected,
  isBreakoutRoom: meetingIsBreakout(),
}))(HeaderContainer));
