import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { isVideoBroadcasting, presenterScreenshareHasEnded,
  presenterScreenshareHasStarted } from './service';
import ScreenshareComponent from './component';

class ScreenshareContainer extends React.Component {
  componentWillUnmount() {
    this.props.presenterScreenshareHasEnded();
  }

  render() {
    if (this.props.isVideoBroadcasting()) {
      return <ScreenshareComponent {...this.props} />;
    }

    return null;
  }
}

export default withTracker(() => ({
  isVideoBroadcasting,
  presenterScreenshareHasStarted,
  presenterScreenshareHasEnded,
}))(ScreenshareContainer);

