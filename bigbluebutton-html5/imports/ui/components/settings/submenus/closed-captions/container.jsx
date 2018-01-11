import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ClosedCaptionsMenu from './component';
import Service from './service';

const ClosedCaptionsMenuContainer = ({ children, ...props }) => (
  <ClosedCaptionsMenu {...props}>
    {children}
  </ClosedCaptionsMenu>
);

export default withTracker(() => Service.getClosedCaptionSettings(), ClosedCaptionsMenuContainer);
