import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users/';
import Auth from '/imports/ui/services/auth';
import mapUser from '/imports/ui/services/user/mapUser';
import { isVideoBroadcasting, presenterScreenshareHasEnded, unshareScreen,
  presenterScreenshareHasStarted } from './service';
import ScreenshareComponent from './component';

class ScreenshareContainer extends React.Component {
  render() {
    if (this.props.isVideoBroadcasting()) {
      return <ScreenshareComponent {...this.props} />;
    }

    return null;
  }
}

export default withTracker(() => {
  const user = Users.findOne({ userId: Auth.userID });
  const MappedUser = mapUser(user);
  return {
    isPresenter: MappedUser.isPresenter,
    unshareScreen,
    isVideoBroadcasting,
    presenterScreenshareHasStarted,
    presenterScreenshareHasEnded,
  };
})(ScreenshareContainer);
