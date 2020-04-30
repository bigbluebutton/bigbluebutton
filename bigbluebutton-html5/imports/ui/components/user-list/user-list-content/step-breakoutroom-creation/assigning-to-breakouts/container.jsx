import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Assign from './component';
import ActionsBarService from '/imports/ui/components/actions-bar/service';

export default withTracker(() => ({
  users: ActionsBarService.users(),
}))(Assign);
