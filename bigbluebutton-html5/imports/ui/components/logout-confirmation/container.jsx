import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import userListService from '../user-list/service';
import LogoutConfirmation from './component';
import LogoutConfirmationService from './service';

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

  return {
    isModerator: userListService.getCurrentUser().isModerator,
    endMeeting: LogoutConfirmationService.endMeeting,
  };

}, LogoutConfirmationContainer);
