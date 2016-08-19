import React from 'react';
import {videoIsBroadcasting} from './service';
import { createContainer } from 'meteor/react-meteor-data';
import DeskshareComponent from './component';

class DeskshareContainer extends React.Component {
  render() {
    if (this.props.videoIsBroadcasting) {
      console.log("gonna render DS component");
      return <DeskshareComponent />;
    } else {
      //return null;
      return <p>hello</p>;
    }
  }
}

export default createContainer(() => {
  console.log("inside ds container");
  const data = { videoIsBroadcasting: videoIsBroadcasting() };
  return data;
}, DeskshareContainer);
