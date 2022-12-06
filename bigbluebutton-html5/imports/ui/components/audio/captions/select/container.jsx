import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/speech/service';
import Select from './component';

const Container = (props) => <Select {...props} />;

export default withTracker(() => ({
  enabled: Service.isEnabled(),
  locale: Service.getSpeechLocale(),
  voices: Service.getSpeechVoices(),
}))(Container);
