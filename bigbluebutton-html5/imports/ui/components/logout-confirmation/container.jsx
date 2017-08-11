import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import userListService from '../user-list/service';
import LogoutConfirmation from './component';

class LogoutConfirmationContainer extends Component {
    
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <LogoutConfirmation {...this.props} />
    );
  }
}

export default createContainer(() => {
    
  const isModerator = userListService.getCurrentUser().isModerator;
  const endMeeting = () => makeCall('endMeeting', Auth.credentials);
  
  return {
    isModerator,
    endMeeting,
  };

}, LogoutConfirmationContainer);
