import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ClosedCaptionsService from './service';
import ClosedCaptions from './component';

const ClosedCaptionsContainer = props => (
  <ClosedCaptions {...props} />
);

export default withTracker(() => ClosedCaptionsService.getCCData())(ClosedCaptionsContainer);
