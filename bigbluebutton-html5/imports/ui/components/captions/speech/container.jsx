import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import CaptionsService from '/imports/ui/components/captions/service';
import Speech from './component';

const Container = (props) => <Speech {...props} />;

export default withTracker(() => {
  const {
    locale,
    dictating,
  } = CaptionsService.getDictationStatus();

  return {
    locale,
    dictating,
  };
})(Container);
