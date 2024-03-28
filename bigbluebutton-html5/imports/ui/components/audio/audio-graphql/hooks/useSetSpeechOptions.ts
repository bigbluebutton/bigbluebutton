import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { USER_SET_SPEECH_OPTIONS } from '../queries';

const useSetSpeechOptions = () => {
  const [mutation] = useMutation(USER_SET_SPEECH_OPTIONS);

  const setSpeechOptions = (
    partialUtterances: boolean,
    minUtteranceLength: number,
  ) => {
    mutation({
      variables: {
        partialUtterances,
        minUtteranceLength,
      },
    });
  };

  return useCallback(setSpeechOptions, [mutation]);
};

export default useSetSpeechOptions;
