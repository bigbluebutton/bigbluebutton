import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users/';
import Auth from '/imports/ui/services/auth';
import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
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
  const user = Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } });
  return {
    isPresenter: user.presenter,
    unshareScreen,
    isVideoBroadcasting,
    presenterScreenshareHasStarted,
    presenterScreenshareHasEnded,
    getSwapLayout,
    shouldEnableSwapLayout,
    toggleSwapLayout: MediaService.toggleSwapLayout,
  };
})(ScreenshareContainer);
