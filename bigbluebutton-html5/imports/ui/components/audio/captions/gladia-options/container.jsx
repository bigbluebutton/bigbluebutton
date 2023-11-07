import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/speech/service';
import GladiaOptions from './component';

const Container = (props) => <GladiaOptions {...props} />;

export default withTracker(() => ({
  enabled: Service.isGladia(),
  onChanged: Service.setSpeechOptions,
}))(Container);
