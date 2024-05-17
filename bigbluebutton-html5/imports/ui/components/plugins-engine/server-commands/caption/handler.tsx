import { useEffect } from 'react';
import { SaveCaptionCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/caption/types';
import { useMutation } from '@apollo/client';
import * as uuidLib from 'uuid';
import {
  CaptionCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/caption/enum';
import SUBMIT_TRANSCRIPT from './mutation';

const PluginCaptionServerCommandsHandler = () => {
  const [submitTranscript] = useMutation(SUBMIT_TRANSCRIPT);
  const handleFillChatFormThroughPlugin = ((
    event: CustomEvent<SaveCaptionCommandArguments>,
  ) => {
    submitTranscript({
      variables: {
        transcriptId: uuidLib.v4(),
        transcript: event.detail.text,
        locale: event.detail.locale,
      },
    });
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(CaptionCommandsEnum.SAVE, handleFillChatFormThroughPlugin);

    return () => {
      window.removeEventListener(CaptionCommandsEnum.SAVE, handleFillChatFormThroughPlugin);
    };
  }, []);
  return null;
};

export default PluginCaptionServerCommandsHandler;
