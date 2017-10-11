import { createContainer } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/service';
import React from 'react';
import AudioNotification from './component';

const AudioNotificationContainer = props => (
  <AudioNotification
    {...props}
  />
);

export default createContainer(() => (
  {
    message: Service.error(),
  }
), AudioNotificationContainer);
