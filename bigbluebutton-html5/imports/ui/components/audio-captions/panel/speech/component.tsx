import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import {
  getCaptionsTermsLink,
  getSpeechVoices,
  isGladia,
  setUserLocaleProperty,
  useIsAudioTranscriptionEnabled,
  useAppsGallery,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/service';
import { hasSpeechRecognitionSupport } from '/imports/ui/components/audio/audio-graphql/audio-captions/speech/service';
import AudioCaptionsSpeechSelectorContainer from './selector/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { DEVICE_TYPE } from '/imports/ui/components/layout/enums';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { AudioCaptionsSpeechControlsProps } from './types';
import Styled from './styles';

const intlMessages = defineMessages({
  transcription: {
    id: 'app.audio.captions.speech.title',
    description: 'Audio speech recognition title',
  },
  transcriptionTip: {
    id: 'app.audio.captions.speech.tip',
    description: 'Audio speech recognition tip',
  },
  captionsTermsOfUse: {
    id: 'app.audio.captions.terms',
    description: 'Audio Speech recognition terms of use',
  },
  captionsTermsLinkText: {
    id: 'app.audio.captions.terms.linkText',
    description: 'Text for the anchor tag with link',
  },
  unsupported: {
    id: 'app.audio.captions.speech.unsupported',
    description: 'Audio speech recognition unsupported',
  },
});

const AudioCaptionsSpeechControls = ({ showTerms, audioModal = false }: AudioCaptionsSpeechControlsProps) => {
  const intl = useIntl();
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);
  const captionsTermsLink = showTerms && getCaptionsTermsLink(intl.locale);
  const [speechChecked, setSpeechChecked] = useState<boolean>(false);
  const [voicesList, setVoicesList] = useState<string[]>([]);
  const voices = getSpeechVoices();
  const isEnabled = useIsAudioTranscriptionEnabled();
  const shouldUseAppsGallery = useAppsGallery();
  const isMobile = layoutSelect((i: Layout) => i.deviceType) === DEVICE_TYPE.MOBILE;
  const {
    data: currentUser,
  } = useCurrentUser(
    (user) => ({
      speechLocale: user.speechLocale,
    }),
  );

  const speechLocale = currentUser?.speechLocale || '';
  useEffect(() => {
    if (speechLocale) {
      setSpeechChecked(true);
    }
  }, [speechLocale]);

  useEffect(() => {
    if (!speechChecked && speechLocale) {
      setUserLocaleProperty('', setUserSpeechLocale);
    }
  }, [speechChecked]);

  const setUserSpeechLocale = (locale: string, provider: string) => {
    setSpeechLocaleMutation({
      variables: {
        locale,
        provider,
      },
    });
  };

  const renderNoSupportMessage = () => {
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
  };

  const renderSubToggleInfo = () => {
    if (!hasSupport) return renderNoSupportMessage();
    if (captionsTermsLink) {
      return (
        <Styled.CaptionsTerms>
          {intl.formatMessage(intlMessages.captionsTermsOfUse, {
            0: (
              <Styled.CaptionsTermsLink target="_blank" rel="noreferrer" href={captionsTermsLink}>
                {intl.formatMessage(intlMessages.captionsTermsLinkText)}
              </Styled.CaptionsTermsLink>
            ),
          })}
        </Styled.CaptionsTerms>
      );
    }
    return (
      <Styled.CaptionsTerms>
        {intl.formatMessage(intlMessages.transcriptionTip)}
      </Styled.CaptionsTerms>
    );
  };

  useEffect(() => {
    if (voices && voicesList.length === 0) {
      setVoicesList(voices);
    }
  }, [voices]);

  const speechVoices = voices || voicesList;
  const speechRecognitionSupport = useMemo(() => hasSpeechRecognitionSupport(), []);
  const noSupport = (!speechRecognitionSupport || speechVoices.length === 0) && !isGladia();
  const hasSupport = !noSupport;
  if (!isEnabled) return null;
  if (shouldUseAppsGallery && audioModal) return null;

  return (
    <Styled.TranscriptionToggleContainer addPadding={audioModal && !isMobile}>
      <Styled.SwitchTitle
        sx={{ margin: 0 }}
        control={(
          <Styled.MaterialSwitch
            sx={{ marginRight: '1rem' }}
            checked={hasSupport && speechChecked}
            disabled={noSupport}
            onChange={(_: unknown, checked: boolean) => {
              setSpeechChecked(checked);
            }}
          />
        )}
        label={intl.formatMessage(intlMessages.transcription)}
      />
      {renderSubToggleInfo()}
      { hasSupport && (
        <AudioCaptionsSpeechSelectorContainer
          speechChecked={speechChecked}
          speechVoices={speechVoices}
        />
      )}
    </Styled.TranscriptionToggleContainer>
  );
};

export default AudioCaptionsSpeechControls;
