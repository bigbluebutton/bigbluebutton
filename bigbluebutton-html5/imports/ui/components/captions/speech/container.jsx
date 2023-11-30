import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import CaptionsService from '/imports/ui/components/captions/service';
import Speech from './component';

const Container = (props) => <Speech {...props} />;

export default withTracker(({ isModerator }) => {
  const {
    locale,
    dictating,
  } = CaptionsService.getDictationStatus(isModerator);

  return {
    locale,
    dictating,
  };
})(Container);
