import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { isVideoBroadcasting, presenterScreenshareHasEnded,
  presenterScreenshareHasStarted } from './service';
import ScreenshareComponent from './component';

class ScreenshareContainer extends React.Component {
  render() {
    if (this.props.isVideoBroadcasting()) {
      return <ScreenshareComponent {...this.props} />;
    }
  }

  componentWillUnmount() {
    this.props.presenterScreenshareHasEnded();
  }

}

export default createContainer(() => ({
  isVideoBroadcasting,
  presenterScreenshareHasStarted,
  presenterScreenshareHasEnded,
}), ScreenshareContainer);

