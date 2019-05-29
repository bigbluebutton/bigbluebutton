import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserCaptionsItem from './component';
import CaptionsService from '/imports/ui/components/captions/service';

const UserCaptionsItemContainer = props => <UserCaptionsItem {...props} />;

export default withTracker(() => ({
  ownedLocales: CaptionsService.getOwnedLocales(),
}))(UserCaptionsItemContainer);
