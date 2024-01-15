import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { useMutation } from '@apollo/client';
import { diff } from '@mconf/bbb-diff';
import Service from './service';
import Speech from './component';
import AudioCaptionsSpeechContainer from '../../audio-graphql/audio-captions/speech/component';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import { SUBMIT_TEXT } from './mutations';

let prevId = '';
let prevTranscript = '';

const Container = (props) => {
  const [setSpeechLocale] = useMutation(SET_SPEECH_LOCALE);
  const [submitText] = useMutation(SUBMIT_TEXT);

  const setUserSpeechLocale = (locale, provider) => {
    setSpeechLocale({
      variables: {
        locale,
        provider,
      },
    });
  };

  const captionSubmitText = (id, transcript, locale, isFinal) => {
    // If it's a new sentence
    if (id !== prevId) {
      prevId = id;
      prevTranscript = '';
    }

    const transcriptDiff = diff(prevTranscript, transcript);

    let start = 0;
    let end = 0;
    let text = '';
    if (transcriptDiff) {
      start = transcriptDiff.start;
      end = transcriptDiff.end;
      text = transcriptDiff.text;
    }

    // Stores current transcript as previous
    prevTranscript = transcript;

    submitText({
      variables: {
        transcriptId: id,
        start,
        end,
        text,
        transcript,
        locale,
        isFinal,
      },
    });
  };

  return (
    <Speech
      setUserSpeechLocale={setUserSpeechLocale}
      captionSubmitText={captionSubmitText}
      {...props}
    />
  );
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
