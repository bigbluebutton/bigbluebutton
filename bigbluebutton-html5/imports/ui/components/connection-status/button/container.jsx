import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { useSubscription } from '@apollo/client';
import ConnectionStatusButtonComponent from './component';
import Service from '../service';
import { CONNECTION_STATUS_REPORT_SUBSCRIPTION } from '../queries';

const connectionStatusButtonContainer = (props) => {
  const { data } = useSubscription(CONNECTION_STATUS_REPORT_SUBSCRIPTION);

  const connectionData = data ? Service.sortConnectionData(data.user_connectionStatusReport) : [];

  return <ConnectionStatusButtonComponent connectionData={connectionData} {...props} />;
};

export default withTracker(() => {
  const { connected } = Meteor.status();

  return {
    connected,
  };
})(connectionStatusButtonContainer);
