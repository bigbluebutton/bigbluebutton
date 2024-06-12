import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { USER_SET_SPEECH_OPTIONS } from '../mutations';

const useSetSpeechOptions = () => {
  const [userSetSpeechOptions] = useMutation(USER_SET_SPEECH_OPTIONS);

  const setSpeechOptions = (
    partialUtterances: boolean,
    minUtteranceLength: number,
  ) => {
    userSetSpeechOptions({
      variables: {
        partialUtterances,
        minUtteranceLength,
      },
    });
  };

  return useCallback(setSpeechOptions, [userSetSpeechOptions]);
};

export default useSetSpeechOptions;
