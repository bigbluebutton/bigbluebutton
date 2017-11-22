import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PollingService from './service';
import PollingComponent from './component';

const PollingContainer = ({
  pollExists, poll, handleVote, ...props
}) => {
  if (!pollExists) return null;
  return <PollingComponent poll={poll} handleVote={handleVote} {...props} />;
};
export default createContainer(() => {
  const data = PollingService.mapPolls();
  return data;
}, PollingContainer);
