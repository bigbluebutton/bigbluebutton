import { useEffect } from 'react';
import { CaptionSaveCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/caption/types';
import { useMutation } from '@apollo/client';
import * as uuidLib from 'uuid';
import {
  CaptionCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/caption/enum';
import SUBMIT_TRANSCRIPT from './mutations';

const PluginSaveCaptionServerCommandsManager = () => {
  const [submitTranscript] = useMutation(SUBMIT_TRANSCRIPT);
  const handleSubmitCaption = ((
    event: CustomEvent<CaptionSaveCommandArguments>,
  ) => {
    submitTranscript({
      variables: {
        transcriptId: uuidLib.v4(),
        transcript: event.detail.text,
        locale: event.detail.locale,
        captionType: event.detail.captionType,
      },
    });
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(CaptionCommandsEnum.SAVE, handleSubmitCaption);

    return () => {
      window.removeEventListener(CaptionCommandsEnum.SAVE, handleSubmitCaption);
    };
  }, []);
  return null;
};

export default PluginSaveCaptionServerCommandsManager;
