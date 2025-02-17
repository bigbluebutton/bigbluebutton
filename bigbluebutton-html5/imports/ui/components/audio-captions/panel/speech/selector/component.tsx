import React, { useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  setUserLocaleProperty,
  useFixedLocale,
  isGladia,
  getLocaleName,
  setSpeechLocale,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import { TRANSCRIPTION_LOCALE } from '/imports/ui/components/audio/audio-graphql/audio-captions/transcriptionLocale';
import { AudioCaptionsSpeechSelectorContainerProps, AudioCaptionsSpeechSelectorProps } from './types';
import {
  getLocale,
  localeAsDefaultSelected,
  mostSimilarLanguage,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/speech/service';
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

const AudioCaptionsSpeechSelector: React.FC<AudioCaptionsSpeechSelectorProps> = ({
  speechLocale,
  speechVoices,
  speechChecked,
}) => {
  const useLocaleHook = useFixedLocale();
  const intl = useIntl();
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);
  const lastSelectedSpeechLocale = useRef<string>('');

  const setUserSpeechLocale = (speechLocale: string, provider: string) => {
    // When speechLocale is '' we disable the transcription provider
    setSpeechLocaleMutation({
      variables: {
        locale: speechLocale,
        provider: speechLocale !== '' ? provider : '',
      },
    });
  };

  const setDefaultLocale = () => {
    if (useLocaleHook || localeAsDefaultSelected()) {
      setSpeechLocale(getLocale(), setUserSpeechLocale);
    } else {
      setSpeechLocale(mostSimilarLanguage(navigator.language), setUserSpeechLocale);
    }
  };

  useEffect(() => {
    if (speechChecked && !speechLocale) {
      if (!lastSelectedSpeechLocale.current) {
        setDefaultLocale();
        return;
      }
      setSpeechLocale(lastSelectedSpeechLocale.current, setUserSpeechLocale);
    }
  }, [speechChecked]);

  useEffect(() => {
    if (!useLocaleHook && speechLocale) {
      lastSelectedSpeechLocale.current = speechLocale;
    }
  }, [speechLocale]);

  if (useLocaleHook || !speechLocale || !speechChecked) return null;

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
          setUserLocaleProperty(value, setUserSpeechLocale);
        }}
        value={speechLocale || ''}
      >
        {isGladia() && (
          <MenuItem
            key="auto"
            value="auto"
          >
            {intl.formatMessage(intlMessages.auto)}
          </MenuItem>
        )}
        {speechVoices.map((voice) => (
          <MenuItem
            key={voice}
            value={voice}
          >
            {intlMessages[voice as keyof typeof intlMessages]
              ? intl.formatMessage(intlMessages[voice as keyof typeof intlMessages])
              : getLocaleName(voice)}
          </MenuItem>
        ))}
      </Styled.CaptionsSelector>
    </Styled.CaptionsSelectorContainer>
  );
};

const AudioCaptionsSpeechSelectorContainer: React.FC<AudioCaptionsSpeechSelectorContainerProps> = ({
  speechChecked,
  speechVoices,
}) => {
  const {
    data: currentUser,
  } = useCurrentUser(
    (user) => ({
      speechLocale: user.speechLocale,
    }),
  );

  if (!currentUser) return null;

  return (
    <AudioCaptionsSpeechSelector
      speechLocale={currentUser.speechLocale ?? ''}
      speechVoices={speechVoices}
      speechChecked={speechChecked}
    />
  );
};

export default AudioCaptionsSpeechSelectorContainer;
