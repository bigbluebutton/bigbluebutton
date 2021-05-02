import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ConnectionStatusService from '../service';
import ConnectionStatusButtonComponent from './component';

const connectionStatusButtonContainer = props => <ConnectionStatusButtonComponent {...props} />;

export default withTracker(() => {
  const { connected } = Meteor.status();

  return {
    connected,
    stats: ConnectionStatusService.getStats(),
  };
})(connectionStatusButtonContainer);
