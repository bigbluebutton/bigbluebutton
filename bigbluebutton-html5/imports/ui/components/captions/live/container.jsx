import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/captions/service';
import LiveCaptions from './component';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

const Container = (props) => <LiveCaptions {...props} />;

export default withTracker(() => {
  const [MeetingSettings] = useMeetingSettings();
  const captionsConfig = MeetingSettings.public.captions;

  return {
    captionsConfig,
    data: Service.getCaptionsData(),
  };
})(Container);
