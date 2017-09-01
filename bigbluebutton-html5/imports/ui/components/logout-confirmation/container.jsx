import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
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
    isModerator: LogoutConfirmationService.isModerator,
    endMeeting: LogoutConfirmationService.endMeeting,
  };

}, LogoutConfirmationContainer);
