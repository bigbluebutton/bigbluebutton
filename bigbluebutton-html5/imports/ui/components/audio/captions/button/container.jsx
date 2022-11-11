import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/service';
import Button from './component';

const Container = (props) => <Button {...props} />;

export default withTracker(() => ({
  enabled: Service.hasAudioCaptions(),
  active: Service.getAudioCaptions(),
}))(Container);
