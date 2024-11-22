import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  getSpeechVoices,
  setUserLocaleProperty,
  useFixedLocale,
  isGladia,
  useIsAudioTranscriptionEnabled,
  getLocaleName,
  getCaptionsTermsLink,
} from '../../audio/audio-graphql/audio-captions/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import { TRANSCRIPTION_LOCALE } from '/imports/ui/components/audio/audio-graphql/audio-captions/transcriptionLocale';
import Styled from '../styles';

const messages: { [key: string]: { id: string; description?: string } } = {
  title: {
    id: 'app.audio.captions.speech.title',
    description: 'Audio speech recognition title',
  },
  disabled: {
    id: 'app.audio.captions.speech.disabled',
    description: 'Audio speech recognition disabled',
  },
  unsupported: {
    id: 'app.audio.captions.speech.unsupported',
    description: 'Audio speech recognition unsupported',
  },
  auto: {
    id: 'app.audio.captions.speech.auto',
    description: 'Audio speech recognition auto',
  },
  captionsTermsOfUse: {
    id: 'app.audio.captions.terms',
    description: 'Audio Speech recognition terms of use',
  },
  captionsTermsLinkText: {
    id: 'app.audio.captions.terms.linkText',
    description: 'Text for the anchor tag with link',
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

const AudioCaptions: React.FC = () => {
  const isTranscriptionEnabled = useIsAudioTranscriptionEnabled();
  const useLocaleHook = useFixedLocale();
  const [voicesList, setVoicesList] = React.useState<string[]>([]);
  const voices = getSpeechVoices();
  const intl = useIntl();
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);
  const [captionsChecked, setCaptionsChecked] = React.useState(false);

  useEffect(() => {
    if (voices && voicesList.length === 0) {
      setVoicesList(voices);
    }
  }, [voices]);
  const {
    data: currentUser,
  } = useCurrentUser(
    (user) => ({
      speechLocale: user.speechLocale,
      voice: user.voice,
    }),
  );

  const setUserSpeechLocale = (speechLocale: string, provider: string) => {
    setSpeechLocaleMutation({
      variables: {
        locale: speechLocale,
        provider,
      },
    });
  };

  useEffect(() => {
    if (currentUser?.speechLocale) {
      setCaptionsChecked(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!captionsChecked && currentUser?.speechLocale) {
      setUserLocaleProperty('', setUserSpeechLocale);
    }
  }, [captionsChecked]);

  if (!currentUser || !isTranscriptionEnabled || !voices || useLocaleHook) return null;

  const speechVoices = voices || voicesList;

  if (speechVoices.length === 0 && !isGladia()) {
    return (
      <span
        data-test="speechRecognitionUnsupported"
        style={{
          fontSize: '.75rem',
          padding: '1rem 0',
        }}
      >
        {`*${intl.formatMessage(intlMessages.unsupported)}`}
      </span>
    );
  }

  const captionsTermsLink = getCaptionsTermsLink(intl.locale);

  return (
    <Styled.CaptionsContainer>
      <Styled.CaptionsToggleContainer>
        <Styled.SwitchTitle
          control={(
            <Styled.DefaultSwitch
              checked={captionsChecked}
              onChange={(_, checked) => {
                setCaptionsChecked(checked);
              }}
            />
          )}
          label={intl.formatMessage(intlMessages.title)}
        />
        {captionsTermsLink && (
          <Styled.CaptionsTerms>
            {intl.formatMessage(intlMessages.captionsTermsOfUse, {
              0: (
                <Styled.CaptionsTermsLink target="_blank" rel="noreferrer" href={getCaptionsTermsLink(intl.locale)}>
                  {intl.formatMessage(intlMessages.captionsTermsLinkText)}
                </Styled.CaptionsTermsLink>
              ),
            })}
          </Styled.CaptionsTerms>
        )}
      </Styled.CaptionsToggleContainer>
      {captionsChecked && (
        <Styled.CaptionsSelectorContainer>
          <Styled.CaptionsLanguageText>
            {intl.formatMessage(intlMessages.language)}
          </Styled.CaptionsLanguageText>
          <Styled.DeviceSelector
            id="speechSelect"
            IconComponent={ExpandMoreIcon}
            onChange={(event: SelectChangeEvent<unknown>) => {
              const value = event.target.value as string;
              setUserLocaleProperty(value, setUserSpeechLocale);
            }}
            value={currentUser.speechLocale || ''}
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
          </Styled.DeviceSelector>
        </Styled.CaptionsSelectorContainer>
      )}
    </Styled.CaptionsContainer>
  );
};

export default AudioCaptions;
