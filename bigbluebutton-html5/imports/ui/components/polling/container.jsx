import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PollingService from './service';
import PollingComponent from './component';

const PollingContainer = (props, { pollExists, poll, handleVote }) => {
  if (!pollExists) return null;
  return <PollingComponent poll={poll} handleVote={handleVote} />;
};
export default createContainer(() => {
  const data = PollingService.mapPolls();
  return data;
}, PollingContainer);
