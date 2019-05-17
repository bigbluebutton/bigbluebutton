import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import CaptionsService from './service';
import Captions from './component';

const CaptionsContainer = props => (
  <Captions {...props} />
);

export default withTracker(() => {
  const {
    backgroundColor,
    fontColor,
    fontFamily,
    fontSize,
  } = CaptionsService.getCaptionsSettings();

  return {
    fontFamily,
    fontSize,
    fontColor,
    backgroundColor,
    captions: CaptionsService.getCaptionsData(),
  };
})(CaptionsContainer);
