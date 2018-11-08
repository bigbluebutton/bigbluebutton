import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import UserContent from './component';

const UserContentContainer = ({ ...props }) => <UserContent {...props} />;

export default withTracker(({ }) => ({
  pollIsOpen: Session.equals('isPollOpen', true),
  forcePollOpen: Session.equals('forcePollOpen', true),
}))(UserContentContainer);
