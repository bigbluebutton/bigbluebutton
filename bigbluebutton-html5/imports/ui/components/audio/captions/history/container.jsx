import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/service';
import CaptionsHistory from './component';

const Container = (props) => <CaptionsHistory {...props} />;

export default withTracker(() => {
  const captions = Service.getAudioCaptionsData();

  const lastCaption = captions?.length ? captions[captions.length-1] : {};

  return {
    captions,
    lastTranscript: lastCaption?.transcript,
    lastTranscriptId: lastCaption?.transcriptId,
  };
})(Container);
