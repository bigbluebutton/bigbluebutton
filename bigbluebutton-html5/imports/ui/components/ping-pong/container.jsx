import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PingPong from '/imports/api/ping-pong';
import { makeCall } from '/imports/ui/services/api';

class PlaceHolderComponent extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return null;
  }
}

export default withTracker(() => {
  PingPong.find({}).observe({
    added: () => makeCall('ping'),
    changed: () => makeCall('ping'),
  });
  return {};
})(PlaceHolderComponent);
