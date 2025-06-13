import React, { useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  setUserLocaleProperty,
  useFixedLocale,
  getLocaleName,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/service';
import { SET_CAPTION_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import { TRANSCRIPTION_LOCALE } from '/imports/ui/components/audio/audio-graphql/audio-captions/transcriptionLocale';
import { mostSimilarLanguage } from '/imports/ui/components/audio/audio-graphql/audio-captions/speech/service';
import { AudioCaptionsTextSelectorProps } from './types';
import Styled from './styles';

const messages: { [key: string]: { id: string; description?: string } } = {
  auto: {
    id: 'app.audio.captions.speech.auto',
    description: 'Audio speech recognition auto',
  },
  language: {
    id: 'app.audio.captions.button.language',
    description: 'Audio speech recognition language label',
  },
};

const intlMessages = defineMessages(messages);

Object.keys(TRANSCRIPTION_LOCALE).forEach((key: string) => {
  const localeKey = TRANSCRIPTION_LOCALE[key as keyof typeof TRANSCRIPTION_LOCALE];
  messages[localeKey] = {
    id: `app.audio.captions.select.${localeKey}`,
    description: `Audio speech recognition ${key} language`,
  };
});

const AudioCaptionsTextSelector: React.FC<AudioCaptionsTextSelectorProps> = ({
  captionLocale,
  availableCaptions,
  captionActive,
}) => {
  const useLocaleHook = useFixedLocale();
  const intl = useIntl();
  const [setCaptionLocaleMutation] = useMutation(SET_CAPTION_LOCALE);
  const lastSelectedTextLocale = useRef<string>('');

  const setUserCaptionLocale = (captionLocale: string, provider: string) => {
    setCaptionLocaleMutation({
      variables: {
        locale: captionLocale,
        provider,
      },
    });
  };

  const initCaptionLocale = () => {
    setUserLocaleProperty(mostSimilarLanguage(navigator.language), setUserCaptionLocale);
  };

  useEffect(() => {
    if (captionActive && !captionLocale) {
      if (!lastSelectedTextLocale.current) {
        initCaptionLocale();
        return;
      }
      setUserLocaleProperty(lastSelectedTextLocale.current, setUserCaptionLocale);
    }
  }, [captionActive, captionLocale]);

  useEffect(() => {
    if (!useLocaleHook && captionLocale) {
      lastSelectedTextLocale.current = captionLocale;
    }
  }, [captionLocale]);

  if (useLocaleHook || !captionLocale || !captionActive) return null;

  return (
    <Styled.CaptionsSelectorContainer>
      <Styled.CaptionsLanguageText>
        {intl.formatMessage(intlMessages.language)}
      </Styled.CaptionsLanguageText>
      <Styled.CaptionsSelector
        id="speechSelect"
        IconComponent={ExpandMoreIcon}
        onChange={(event: SelectChangeEvent<unknown>) => {
          const value = event.target.value as string;
          setUserLocaleProperty(value, setUserCaptionLocale);
        }}
        value={captionLocale || ''}
      >
        {availableCaptions.map((caption) => (
          <MenuItem
            key={caption}
            value={caption}
          >
            {intlMessages[caption as keyof typeof intlMessages]
              ? intl.formatMessage(intlMessages[caption as keyof typeof intlMessages])
              : getLocaleName(caption)}
          </MenuItem>
        ))}
      </Styled.CaptionsSelector>
    </Styled.CaptionsSelectorContainer>
  );
};

export default AudioCaptionsTextSelector;
