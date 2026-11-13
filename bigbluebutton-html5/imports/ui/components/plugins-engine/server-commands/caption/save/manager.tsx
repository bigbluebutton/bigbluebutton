import { useEffect } from 'react';
import { CaptionSaveCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/caption/types';
import { useMutation } from '@apollo/client';
import * as uuidLib from 'uuid';
import {
  CaptionCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/caption/enum';
import SUBMIT_TRANSCRIPT from './mutations';
import logger from '/imports/startup/client/logger';

// akka-apps drops a caption longer than this, so refuse it here where it can be logged
const getMaxTextLength = (): number => window.meetingClientSettings?.public?.captions
  ?.maxTextLength ?? 8192;

const PluginSaveCaptionServerCommandsManager = () => {
  const [submitTranscript] = useMutation(SUBMIT_TRANSCRIPT);
  const handleSubmitCaption = ((
    event: CustomEvent<CaptionSaveCommandArguments>,
  ) => {
    const maxTextLength = getMaxTextLength();
    if (event.detail.text.length > maxTextLength) {
      logger.warn({
        logCode: 'plugin_caption_save_too_long',
        extraInfo: { length: event.detail.text.length, maxTextLength },
      }, 'Plugin tried to save a caption longer than the maximum text length');
      return;
    }
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
