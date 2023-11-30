import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/service';
import LiveCaptions from './component';

const Container = (props) => <LiveCaptions {...props} />;

export default withTracker((props) => {
  return props;
})(Container);
