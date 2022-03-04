import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';

const Container = ({ sessions }) => {
  Service.setCookie(sessions);

  return null;
};

export default withTracker(() => {
  const sessions = Service.getSessions();

  return {
    sessions,
  };
})(Container);
