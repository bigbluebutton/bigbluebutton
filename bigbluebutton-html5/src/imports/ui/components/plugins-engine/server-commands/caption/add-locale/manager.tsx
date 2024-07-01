import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import {
  CaptionCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/caption/enum';
import CAPTION_ADD_LOCALE from './mutations';

const PluginAddLocaleCaptionServerCommandsManager = () => {
  const [captionAddLocale] = useMutation(CAPTION_ADD_LOCALE);
  const handleCaptionAddLocale = ((
    event: CustomEvent<string>,
  ) => {
    captionAddLocale({
      variables: {
        locale: event.detail,
      },
    });
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(CaptionCommandsEnum.ADD_LOCALE, handleCaptionAddLocale);

    return () => {
      window.removeEventListener(CaptionCommandsEnum.ADD_LOCALE, handleCaptionAddLocale);
    };
  }, []);
  return null;
};

export default PluginAddLocaleCaptionServerCommandsManager;
