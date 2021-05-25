import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import LayoutManagerComponent from '/imports/ui/components/layout/layout-manager/component';

const LayoutManagerContainer = ({ screenIsShared }) => (
  <LayoutManagerComponent {...{ screenIsShared }} />
);

export default withTracker(() => ({
  screenIsShared: isVideoBroadcasting(),
}))(LayoutManagerContainer);
