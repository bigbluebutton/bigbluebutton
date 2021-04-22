import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Screenshare from '/imports/api/screenshare';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import LayoutManagerComponent from '/imports/ui/components/layout/layout-manager/component';

const LayoutManagerContainer = ({ screenIsShared }) => {
  return <LayoutManagerComponent {...{ screenIsShared }} />;
};

export default withTracker(() => {
  return {
    screenIsShared: isVideoBroadcasting(),
  };
})(LayoutManagerContainer);
