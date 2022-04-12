import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import Speech from './component';

const Container = (props) => <Speech {...props} />;

export default withTracker(() => {
  const {
    locale,
    connected,
    talking,
  } = Service.getStatus();

  return {
    locale,
    connected,
    talking,
  };
})(Container);
