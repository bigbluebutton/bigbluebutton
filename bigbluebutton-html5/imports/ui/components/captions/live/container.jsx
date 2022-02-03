import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/captions/service';
import LiveCaptions from './component';

const Container = (props) => <LiveCaptions {...props} />;

export default withTracker(() => ({
  data: Service.getCaptionsData(),
}))(Container);
