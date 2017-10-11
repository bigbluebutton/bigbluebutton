import { createContainer } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/service';
import React, { Component } from 'react';
import AudioNotification from './component';


class AudioNotificationContainer extends Component {
  render() {
    return (
      <AudioNotification
        {...this.props}
      />
    );
  }
}

export default createContainer(() => {
  return {
    error: Service.error(),
  };
}, AudioNotificationContainer);
