import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/speech/service';
import Check from './component';

const Container = (props) => <Check {...props} />;

export default withTracker(() => ({
  enabled: Service.isEnabled(),
  speech: Service.getSpeech(),
}))(Container);
