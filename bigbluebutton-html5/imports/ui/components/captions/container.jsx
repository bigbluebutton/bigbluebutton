import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import CaptionsService from './service';
import Captions from './component';

const CaptionsContainer = props => (
  <Captions {...props} />
);

export default withTracker(() => {
  const {
    locale,
    revs,
    data,
  } = CaptionsService.getCaptionsData();

  return {
    locale,
    revs,
    data,
  };
})(CaptionsContainer);
