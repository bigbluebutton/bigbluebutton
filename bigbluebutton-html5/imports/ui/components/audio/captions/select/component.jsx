import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';

const intlMessages = defineMessages({
  title: {
    id: 'app.audio.captions.speech.title',
    description: 'Audio speech recognition title',
  },
  disabled: {
    id: 'app.audio.captions.speech.disabled',
    description: 'Audio speech recognition disabled',
  },
  auto: {
    id: 'app.audio.captions.speech.auto',
    description: 'Audio speech recognition auto',
  },
  unsupported: {
    id: 'app.audio.captions.speech.unsupported',
    description: 'Audio speech recognition unsupported',
  },
  'ca-ES': {
    id: 'app.audio.captions.select.ca-ES',
    description: 'Audio speech recognition catalan language',
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

const Select = ({
  intl,
  enabled,
  locale,
  voices,
}) => {
  const useLocaleHook = SpeechService.useFixedLocale();
  if (!enabled || useLocaleHook) return null;

  if (voices.length === 0) {
    return (
      <div  data-test="speechRecognitionUnsupported"
        style={{
          fontSize: '.75rem',
          padding: '1rem 0',
        }}
      >
        {`*${intl.formatMessage(intlMessages.unsupported)}`}
      </div>
    );
  }

  const onChange = (e) => {
    const { value } = e.target;
    SpeechService.setSpeechLocale(value);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <label
        htmlFor="speechSelect"
        style={{ padding: '0 .5rem' }}
      >
        {intl.formatMessage(intlMessages.title)}
      </label>
      <select
        id="speechSelect"
        onChange={onChange}
        value={locale}
      >
        <option
          key="disabled"
          value=""
        >
          {intl.formatMessage(intlMessages.disabled)}
        </option>
        {SpeechService.isGladia() ?
          <option
            key="auto"
            value="auto"
          >
            {intl.formatMessage(intlMessages.auto)}
          </option>
          : null
        }
        {voices.map((v) => (
          <option
            key={v}
            value={v}
          >
            {intlMessages[v] ? intl.formatMessage(intlMessages[v]) : v}
          </option>
        ))}
      </select>
    </div>
  );
};

Select.propTypes = {
  enabled: PropTypes.bool.isRequired,
  locale: PropTypes.string.isRequired,
  voices: PropTypes.arrayOf(PropTypes.string).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(Select);
