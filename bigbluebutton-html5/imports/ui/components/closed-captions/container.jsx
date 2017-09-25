import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ClosedCaptionsService from './service';
import ClosedCaptions from './component';

const ClosedCaptionsContainer = props => (
  <ClosedCaptions {...props} />
 );

export default createContainer(() => ClosedCaptionsService.getCCData(), ClosedCaptionsContainer);
