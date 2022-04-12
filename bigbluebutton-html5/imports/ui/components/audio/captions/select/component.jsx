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
  'en-US': {
    id: 'app.audio.captions.select.en-US',
    description: 'Audio speech recognition english language',
  },
  'es-ES': {
    id: 'app.audio.captions.select.es-ES',
    description: 'Audio speech recognition spanish language',
  },
  'pt-BR': {
    id: 'app.audio.captions.select.pt-BR',
    description: 'Audio speech recognition portuguese language',
  },
});

const Select = ({
  intl,
  enabled,
  locale,
  voices,
}) => {
  if (!enabled) return null;

  if (SpeechService.useDefault()) return null;

  if (voices.length === 0) return null;

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
        {voices.map((v) => (
          <option
            key={v}
            value={v}
          >
            {intl.formatMessage(intlMessages[v])}
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
