import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/speech/service';
import Speech from './component';

const Container = (props) => <Speech {...props} />;

export default withTracker(() => {
  const {
    locale,
    dictating,
  } = Service.getStatus();

  return {
    locale,
    dictating,
  };
})(Container);
