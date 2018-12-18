import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import PollingService from './service';
import PollingComponent from './component';

const propTypes = {
  pollExists: PropTypes.bool.isRequired,
};

const PollingContainer = ({ pollExists, ...props }) => {
  const currentUser = Users.findOne({ userId: Auth.userID });
  if (pollExists && !currentUser.presenter) {
    return (
      <PollingComponent {...props} />
    );
  }
  return null;
};

PollingContainer.propTypes = propTypes;

export default withTracker(() => {
  const data = PollingService.mapPolls();
  return data;
})(PollingContainer);
