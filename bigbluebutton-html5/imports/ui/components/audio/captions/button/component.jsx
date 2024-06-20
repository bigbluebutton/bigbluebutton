import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Service from '/imports/ui/components/audio/captions/service';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';
import ServiceOldCaptions from '/imports/ui/components/captions/service';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import OldCaptionsService from '/imports/ui/components/captions/service';

const TRANSCRIPTION_DEFAULT_PAD = Meteor.settings.public.captions.defaultPad;

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
  autoDetect: {
    id: 'app.audio.captions.button.autoDetect',
    description: 'Audio speech recognition language auto detect',
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
  'ca-ES': {
    id: 'app.audio.captions.select.ca-ES',
    description: 'Audio speech recognition catalan language',
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
  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const isTranscriptionDisabled = () => (
    currentSpeechLocale === DISABLED
  );

  const fallbackLocale = availableVoices.includes(navigator.language)
    ? navigator.language : DEFAULT_LOCALE;

  const getSelectedLocaleValue = (isTranscriptionDisabled() ? fallbackLocale : currentSpeechLocale);

  const selectedLocale = useRef(getSelectedLocaleValue);

  useEffect(() => {
    if (!isTranscriptionDisabled()) selectedLocale.current = getSelectedLocaleValue;
  }, [currentSpeechLocale]);

  const prevEnabled = usePrevious(enabled);

  if (!enabled) return null;
  if (!prevEnabled && enabled) {
    OldCaptionsService.createCaptions(TRANSCRIPTION_DEFAULT_PAD);
  }

  const shouldRenderChevron = isSupported && isVoiceUser;

  const getAvailableLocales = () => (
    availableVoices.map((availableVoice) => (
      {
        icon: '',
        label: intlMessages[availableVoice] ? intl.formatMessage(intlMessages[availableVoice]) : availableVoice,
        key: availableVoice,
        iconRight: selectedLocale.current === availableVoice ? 'check' : null,
        customStyles: (selectedLocale.current === availableVoice) && Styled.SelectedLabel,
        disabled: isTranscriptionDisabled(),
        dividerTop: !SpeechService.isGladia() && availableVoice === availableVoices[0],
        onClick: () => {
          selectedLocale.current = availableVoice;
          SpeechService.setSpeechLocale(selectedLocale.current);
        },
      }
    ))
  );

  const autoLanguage = SpeechService.isGladia() ? {
    icon: '',
    label: intl.formatMessage(intlMessages.autoDetect),
    key: 'auto',
    iconRight: selectedLocale.current === 'auto' ? 'check' : null,
    customStyles: (selectedLocale.current === 'auto') && Styled.SelectedLabel,
    disabled: isTranscriptionDisabled(),
    dividerTop: true,
    onClick: () => {
      selectedLocale.current = 'auto';
      SpeechService.setSpeechLocale(selectedLocale.current);
    },
  } : undefined;

  const toggleTranscription = () => {
    SpeechService.setSpeechLocale(isTranscriptionDisabled() ? selectedLocale.current : DISABLED);
  };

  const getAvailableLocalesList = () => (
    [{
      key: 'availableLocalesList',
      label: intl.formatMessage(intlMessages.language),
      customStyles: Styled.TitleLabel,
      disabled: true,
      dividerTop: false,
    },
    autoLanguage,
    ...getAvailableLocales(),
    {
      key: 'divider',
      label: intl.formatMessage(intlMessages.transcription),
      customStyles: Styled.TitleLabel,
      disabled: true,
    }, {
      key: 'transcriptionStatus',
      label: intl.formatMessage(
        isTranscriptionDisabled()
          ? intlMessages.transcriptionOn
          : intlMessages.transcriptionOff,
      ),
      customStyles: isTranscriptionDisabled()
        ? Styled.EnableTrascription : Styled.DisableTrascription,
      disabled: false,
      dividerTop: true,
      onClick: toggleTranscription,
    }].filter((e) => e) // filter undefined elements because of 'autoLanguage'
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
