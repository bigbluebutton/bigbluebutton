import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';

import {
  getSpeechVoices,
  setUserLocaleProperty,
  useFixedLocale,
  isGladia,
  useIsAudioTranscriptionEnabled,
  getLocaleName,
} from '../service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import Styled from './styles';

const intlMessages = defineMessages({
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
  'de-DE': {
    id: 'app.audio.captions.select.de-DE',
    description: 'Audio speech recognition german language',
  },
  'en-US': {
    id: 'app.audio.captions.select.en-US',
    description: 'Audio speech recognition english language',
  },
  'es-ES': {
    id: 'app.audio.captions.select.es-ES',
    description: 'Audio speech recognition spanish language',
  },
  'fr-FR': {
    id: 'app.audio.captions.select.fr-FR',
    description: 'Audio speech recognition french language',
  },
  'hi-ID': {
    id: 'app.audio.captions.select.hi-ID',
    description: 'Audio speech recognition indian language',
  },
  'it-IT': {
    id: 'app.audio.captions.select.it-IT',
    description: 'Audio speech recognition italian language',
  },
  'ja-JP': {
    id: 'app.audio.captions.select.ja-JP',
    description: 'Audio speech recognition japanese language',
  },
  'pt-BR': {
    id: 'app.audio.captions.select.pt-BR',
    description: 'Audio speech recognition portuguese language',
  },
  'ru-RU': {
    id: 'app.audio.captions.select.ru-RU',
    description: 'Audio speech recognition russian language',
  },
  'zh-CN': {
    id: 'app.audio.captions.select.zh-CN',
    description: 'Audio speech recognition chinese language',
  },
});

interface AudioCaptionsContainerProps {
  showTitleLabel?: boolean;
}

interface AudioCaptionsSelectProps {
  isTranscriptionEnabled: boolean;
  speechLocale: string;
  speechVoices: string[];
  showTitleLabel?: boolean;
}

const AudioCaptionsSelect: React.FC<AudioCaptionsSelectProps> = ({
  isTranscriptionEnabled,
  speechLocale,
  speechVoices,
  showTitleLabel = true,
}) => {
  const useLocaleHook = useFixedLocale();
  const intl = useIntl();
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);

  const setUserSpeechLocale = (speechLocale: string, provider: string) => {
    if (speechLocale !== '') {
      setSpeechLocaleMutation({
        variables: {
          locale: speechLocale,
          provider,
        },
      });
    }
  };

  if (!isTranscriptionEnabled || useLocaleHook) return null;

  if (speechVoices.length === 0 && !isGladia()) {
    return (
      <div
        data-test="speechRecognitionUnsupported"
        style={{
          fontSize: '.75rem',
          padding: '1rem 0',
        }}
      >
        {`*${intl.formatMessage(intlMessages.unsupported)}`}
      </div>
    );
  }

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setUserLocaleProperty(value, setUserSpeechLocale);
  };

  const renderSelect = () => (
    <Styled.Select
      id="speechSelect"
      onChange={onChange}
      value={speechLocale}
    >
      <option
        key="disabled"
        value=""
      >
        {intl.formatMessage(intlMessages.disabled)}
      </option>
      {isGladia()
        ? (
          <option
            key="auto"
            value="auto"
          >
            {intl.formatMessage(intlMessages.auto)}
          </option>
        )
        : null}
      {speechVoices.map((v) => (
        <option
          key={v}
          value={v}
        >
          {
          intlMessages[v as keyof typeof intlMessages]
            ? intl.formatMessage(intlMessages[v as keyof typeof intlMessages])
            : getLocaleName(v)
          }
        </option>
      ))}
    </Styled.Select>
  );

  return showTitleLabel ? (
    <Styled.CaptionsSelector>
      <label htmlFor="speechSelect" style={{ padding: '0 .5rem' }}>
        {intl.formatMessage(intlMessages.title)}
      </label>
      {renderSelect()}
    </Styled.CaptionsSelector>
  ) : (
    renderSelect()
  );
};

const AudioCaptionsSelectContainer: React.FC<AudioCaptionsContainerProps> = ({
  showTitleLabel = true,
}) => {
  const [voicesList, setVoicesList] = React.useState<string[]>([]);
  const voices = getSpeechVoices();

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
  const isEnabled = useIsAudioTranscriptionEnabled();
  if (!currentUser || !isEnabled || !voices) return null;

  return (
    <AudioCaptionsSelect
      isTranscriptionEnabled={isEnabled}
      speechLocale={currentUser.speechLocale ?? ''}
      speechVoices={voices || voicesList}
      showTitleLabel={showTitleLabel}
    />
  );
};

export default AudioCaptionsSelectContainer;
