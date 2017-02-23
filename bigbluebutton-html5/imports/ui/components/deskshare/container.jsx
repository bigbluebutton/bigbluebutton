import React from 'react';
import {isVideoBroadcasting, presenterDeskshareHasEnded, presenterDeskshareHasStarted} from './service';
import { createContainer } from 'meteor/react-meteor-data';
import DeskshareComponent from './component';

class DeskshareContainer extends React.Component {
  render() {
    if (this.props.isVideoBroadcasting()) {
      return <DeskshareComponent {...this.props} />;
    } else {
      return null;
    }
  }

  componentWillUnmount() {
    this.props.presenterDeskshareHasEnded();
  }

}

export default createContainer(() => {
  const data = {
    isVideoBroadcasting,
    presenterDeskshareHasStarted,
    presenterDeskshareHasEnded,
  };

  return data;
}, DeskshareContainer);
