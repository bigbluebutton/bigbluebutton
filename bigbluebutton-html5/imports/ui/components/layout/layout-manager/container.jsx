import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Screenshare from '/imports/api/screenshare';
import LayoutManagerComponent from '/imports/ui/components/layout/layout-manager/component';

const LayoutManagerContainer = ({ screenIsShared }) => (
  <LayoutManagerComponent {...{ screenIsShared }} />
);

export default withTracker(() => {
  const screenshareEntry = Screenshare.findOne({ meetingId: Auth.meetingID },
    { fields: { 'screenshare.stream': 1 } });
  const screenIsShared = !screenshareEntry ? false : !!screenshareEntry.screenshare.stream;

  return {
    screenIsShared,
  };
})(LayoutManagerContainer);
