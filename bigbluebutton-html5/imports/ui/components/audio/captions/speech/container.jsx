import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import Speech from './component';
import AudioCaptionsSpeechContainer from '../../audio-graphql/audio-captions/speech/component';

const Container = (props) => <Speech {...props} />;

withTracker(() => {
  const {
    locale,
    connected,
    talking,
  } = Service.getStatus();

  return {
    locale,
    connected,
    talking,
  };
})(Container);

export default AudioCaptionsSpeechContainer;
