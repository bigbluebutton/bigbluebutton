import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Service from '/imports/ui/components/audio/captions/service';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import { useMutation } from '@apollo/client';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';

const intlMessages = defineMessages({
  start: {
    id: 'app.audio.captions.button.start',
    description: 'Start audio captions',
  },
  stop: {
    id: 'app.audio.captions.button.stop',
    description: 'Stop audio captions',
  },
  transcriptionSettings: {
    id: 'app.audio.captions.button.transcriptionSettings',
    description: 'Audio captions settings modal',
  },
  transcription: {
    id: 'app.audio.captions.button.transcription',
    description: 'Audio speech transcription label',
  },
  transcriptionOn: {
    id: 'app.switch.onLabel',
  },
  transcriptionOff: {
    id: 'app.switch.offLabel',
  },
  language: {
    id: 'app.audio.captions.button.language',
    description: 'Audio speech recognition language label',
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

const DEFAULT_LOCALE = 'en-US';
const DISABLED = '';

const CaptionsButton = ({
  intl,
  active,
  isRTL,
  enabled,
  currentSpeechLocale,
  availableVoices,
  isSupported,
  isVoiceUser,
}) => {
  const isTranscriptionDisabled = () => (
    currentSpeechLocale === DISABLED
  );

  const [setSpeechLocale] = useMutation(SET_SPEECH_LOCALE);

  const setUserSpeechLocale = (speechLocale, provider) => {
    setSpeechLocale({
      variables: {
        locale: speechLocale,
        provider,
      },
    });
  };

  const fallbackLocale = availableVoices.includes(navigator.language)
    ? navigator.language : DEFAULT_LOCALE;

  const getSelectedLocaleValue = (isTranscriptionDisabled() ? fallbackLocale : currentSpeechLocale);

  const selectedLocale = useRef(getSelectedLocaleValue);

  useEffect(() => {
    if (!isTranscriptionDisabled()) selectedLocale.current = getSelectedLocaleValue;
  }, [currentSpeechLocale]);

  if (!enabled) return null;

  const shouldRenderChevron = isSupported && isVoiceUser;

  const getAvailableLocales = () => {
    let indexToInsertSeparator = -1;
    const availableVoicesObjectToMenu = availableVoices.map((availableVoice, index) => {
      if (availableVoice === availableVoices[0]) {
        indexToInsertSeparator = index;
      }
      return (
        {
          icon: '',
          label: intl.formatMessage(intlMessages[availableVoice]),
          key: availableVoice,
          iconRight: selectedLocale.current === availableVoice ? 'check' : null,
          customStyles: (selectedLocale.current === availableVoice) && Styled.SelectedLabel,
          disabled: isTranscriptionDisabled(),
          onClick: () => {
            selectedLocale.current = availableVoice;
            SpeechService.setSpeechLocale(selectedLocale.current, setUserSpeechLocale);
          },
        }
      );
    });
    if (indexToInsertSeparator >= 0) {
      availableVoicesObjectToMenu.splice(indexToInsertSeparator, 0, {
        key: 'separator-01',
        isSeparator: true,
      });
    }
    return [
      ...availableVoicesObjectToMenu,
    ];
  };

  const toggleTranscription = () => {
    SpeechService.setSpeechLocale(isTranscriptionDisabled() ? selectedLocale.current : DISABLED, setUserSpeechLocale);
  };

  const getAvailableLocalesList = () => (
    [{
      key: 'availableLocalesList',
      label: intl.formatMessage(intlMessages.language),
      customStyles: Styled.TitleLabel,
      disabled: true,
    },
    ...getAvailableLocales(),
    {
      key: 'divider',
      label: intl.formatMessage(intlMessages.transcription),
      customStyles: Styled.TitleLabel,
      disabled: true,
    },
    {
      key: 'separator-02',
      isSeparator: true,
    },
    {
      key: 'transcriptionStatus',
      label: intl.formatMessage(
        isTranscriptionDisabled()
          ? intlMessages.transcriptionOn
          : intlMessages.transcriptionOff,
      ),
      customStyles: isTranscriptionDisabled()
        ? Styled.EnableTrascription : Styled.DisableTrascription,
      disabled: false,
      onClick: toggleTranscription,
    }]
  );

  const onToggleClick = (e) => {
    e.stopPropagation();
    Service.setAudioCaptions(!active);
  };

  const startStopCaptionsButton = (
    <Styled.ClosedCaptionToggleButton
      icon={active ? 'closed_caption' : 'closed_caption_stop'}
      label={intl.formatMessage(active ? intlMessages.stop : intlMessages.start)}
      color={active ? 'primary' : 'default'}
      ghost={!active}
      hideLabel
      circle
      size="lg"
      onClick={onToggleClick}
    />
  );

  return (
    shouldRenderChevron
      ? (
        <Styled.SpanButtonWrapper>
          <BBBMenu
            trigger={(
              <>
                { startStopCaptionsButton }
                <ButtonEmoji
                  emoji="device_list_selector"
                  hideLabel
                  label={intl.formatMessage(intlMessages.transcriptionSettings)}
                  tabIndex={0}
                  rotate
                />
              </>
            )}
            actions={getAvailableLocalesList()}
            opts={{
              id: 'default-dropdown-menu',
              keepMounted: true,
              transitionDuration: 0,
              elevation: 3,
              getcontentanchorel: null,
              fullwidth: 'true',
              anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
              transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
            }}
          />
        </Styled.SpanButtonWrapper>
      ) : startStopCaptionsButton
  );
};

CaptionsButton.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  active: PropTypes.bool.isRequired,
  isRTL: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  currentSpeechLocale: PropTypes.string.isRequired,
  availableVoices: PropTypes.arrayOf(PropTypes.string).isRequired,
  isSupported: PropTypes.bool.isRequired,
  isVoiceUser: PropTypes.bool.isRequired,
};

export default injectIntl(CaptionsButton);