import React from 'react';
import PollingService from './service';
import { createContainer } from 'meteor/react-meteor-data';
import PollingComponent from './component';

class PollingContainer extends React.Component {
  render() {
    if (this.props.pollExists) {
      return <PollingComponent poll={this.props.poll} handleVote={this.props.handleVote} />;
    } else {
      return null;
    }
  }
}

export default createContainer(() => {
  const data = PollingService.mapPolls();
  return data;
}, PollingContainer);
