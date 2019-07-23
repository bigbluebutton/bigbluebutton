import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users/';
import Auth from '/imports/ui/services/auth';
import mapUser from '/imports/ui/services/user/mapUser';
import {
  isVideoBroadcasting, presenterScreenshareHasEnded, unshareScreen,
  presenterScreenshareHasStarted,
} from './service';
import ScreenshareComponent from './component';

const ScreenshareContainer = (props) => {
  const { isVideoBroadcasting: isVB } = props;
  if (isVB()) {
    return <ScreenshareComponent {...props} />;
  }
  return null;
};

export default withTracker(() => {
  const user = Users.findOne({ userId: Auth.userID });
  const MappedUser = mapUser(user);
  const isFullscreen = Session.get('isFullscreen');
  return {
    isPresenter: MappedUser.isPresenter,
    unshareScreen,
    isVideoBroadcasting,
    presenterScreenshareHasStarted,
    presenterScreenshareHasEnded,
    isFullscreen,
  };
})(ScreenshareContainer);
