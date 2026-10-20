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
import { getLocale, localeAsDefaultSelected } from '../speech/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import Session from '/imports/ui/services/storage/in-memory';
import Styled from './styles';
import { TRANSCRIPTION_LOCALE } from '/imports/ui/components/audio/audio-graphql/audio-captions/transcriptionLocale';

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
};

Object.keys(TRANSCRIPTION_LOCALE).forEach((key: string) => {
  const localeKey = TRANSCRIPTION_LOCALE[key as keyof typeof TRANSCRIPTION_LOCALE];
  messages[localeKey] = {
    id: `app.audio.captions.select.${localeKey}`,
    description: `Audio speech recognition ${key} language`,
  };
});

const intlMessages = defineMessages(messages);

// The configured default language is applied once per client session: a user who then picks
// "Disabled" keeps that choice when the audio settings are reopened. A reload applies it again.
const DEFAULT_LOCALE_APPLIED_KEY = 'audioCaptionsDefaultLocaleApplied';

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
    // When speechLocale is '' we disable the transcription provider
    setSpeechLocaleMutation({
      variables: {
        locale: speechLocale,
        provider: speechLocale !== '' ? provider : '',
      },
    });
  };

  if (!isTranscriptionEnabled || useLocaleHook) return null;

  if (speechVoices.length === 0 && !isGladia()) {
    return (
      <div
        data-test="speechRecognitionUnsupported"
        style={{
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
    if ((voices && voices.length > 0) && voicesList.length === 0) {
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
  const fixedLocale = useFixedLocale();
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);
  const speechLocale = currentUser?.speechLocale ?? '';

  // Pre-select the configured language (public.app.audioCaptions.language.locale, when
  // defaultSelectLocale or forceLocale is on) the first time the select mounts for a user
  // who has no speechLocale yet. The speech component used to do this at startup; since
  // 7dffe4aa79 it only does so for providers other than webspeech. getLocale() is '' for
  // locale "disabled", so the default settings keep the select on Disabled.
  useEffect(() => {
    if (!isEnabled || !currentUser || speechLocale !== '') return;
    if (Session.getItem(DEFAULT_LOCALE_APPLIED_KEY)) return;
    if (!fixedLocale && !localeAsDefaultSelected()) return;
    Session.setItem(DEFAULT_LOCALE_APPLIED_KEY, 'true');
    const locale = getLocale();
    if (locale === '') return;
    setUserLocaleProperty(locale, (value: string, provider: string) => {
      setSpeechLocaleMutation({ variables: { locale: value, provider } });
    });
  }, [isEnabled, currentUser, speechLocale, fixedLocale, setSpeechLocaleMutation]);

  if (!currentUser || !isEnabled) return null;

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
