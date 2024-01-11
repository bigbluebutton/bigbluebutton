import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import Speech from './component';
import AudioCaptionsSpeechContainer from '../../audio-graphql/audio-captions/speech/component';
import { useMutation } from '@apollo/client';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';

const Container = (props) => {
  const [setSpeechLocale] = useMutation(SET_SPEECH_LOCALE);

  const setUserSpeechLocale = (locale, provider) => {
    setSpeechLocale({
      variables: {
        locale,
        provider,
      },
    });
  };

  return <Speech setUserSpeechLocale={setUserSpeechLocale} {...props} />;
};

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
