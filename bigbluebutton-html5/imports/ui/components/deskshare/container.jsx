import React from 'react';
import {videoIsBroadcasting} from './DeskshareService';
import { createContainer } from 'meteor/react-meteor-data';
import DeskshareComponent from './DeskshareComponent.jsx';

class DeskshareContainer extends React.Component {
  render() {
    if (this.props.videoIsBroadcasting) {
      return <DeskshareComponent />;
    } else {
      return null;
    }
  }
}

export default createContainer(() => {
  const data = { videoIsBroadcasting: videoIsBroadcasting() };
  return data;
}, DeskshareContainer);
