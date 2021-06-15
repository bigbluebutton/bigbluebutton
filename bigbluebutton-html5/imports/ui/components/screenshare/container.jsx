import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users/';
import Auth from '/imports/ui/services/auth';
import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
import {
  isVideoBroadcasting,
  isGloballyBroadcasting,
} from './service';
import ScreenshareComponent from './component';
import { NLayoutContext } from '../layout/context/context';

const ScreenshareContainer = (props) => {
  const NewLayoutManager = useContext(NLayoutContext);
  const { newLayoutContextState } = NewLayoutManager;
  const { output, layoutLoaded } = newLayoutContextState;
  const { screenShare } = output;

  if (isVideoBroadcasting()) {
    return <ScreenshareComponent {...props} {...screenShare} layoutLoaded={layoutLoaded} />;
  }
  return null;
};

export default withTracker(() => {
  const user = Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } });
  return {
    isGloballyBroadcasting: isGloballyBroadcasting(),
    isPresenter: user.presenter,
    getSwapLayout,
    shouldEnableSwapLayout,
    toggleSwapLayout: MediaService.toggleSwapLayout,
  };
})(ScreenshareContainer);
