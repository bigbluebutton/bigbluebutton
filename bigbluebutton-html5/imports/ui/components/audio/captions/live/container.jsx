import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/service';
import LiveCaptions from './component';
import AudioCaptionsLiveContainer from '../../audio-graphql/audio-captions/live/component';

const Container = (props) => <LiveCaptions {...props} />;

withTracker(() => {
  const {
    transcriptId,
    transcript,
  } = Service.getAudioCaptionsData();

  return {
    transcript,
    transcriptId,
  };
})(Container);

export default AudioCaptionsLiveContainer;
