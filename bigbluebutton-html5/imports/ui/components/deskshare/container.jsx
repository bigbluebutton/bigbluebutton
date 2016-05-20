import React from 'react';
import {videoIsBroadcasting} from './service';
import { createContainer } from 'meteor/react-meteor-data';
import DeskshareComponent from './component';

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
