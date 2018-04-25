import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import FeedbackScreen from './component';

const FeedbackContainer = props => <FeedbackScreen {...props} />;

export default withModalMounter(withTracker(() => {
  const user = Users.findOne({ userId: Auth.userID });
  const userName = user.name;
  return {
    userName,
  };
})(FeedbackContainer));
