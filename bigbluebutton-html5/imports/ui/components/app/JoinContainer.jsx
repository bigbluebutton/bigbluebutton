import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import AppContainer from './AppContainer.jsx';

class JoinContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log('join container render');
    console.log('bb', this.props.params);
    const { meetingID, userID, authToken, ...props } = this.props.params;
    return (
      <AppContainer meetingID={meetingID} userID={userID} authToken={authToken} {...props} >
      </AppContainer>
    );
  }
}

export default createContainer(() => {
  return {};
}, JoinContainer);
