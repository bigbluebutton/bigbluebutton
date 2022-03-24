import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';

const intlMessages = defineMessages({
  title: {
    id: 'app.audio.captions.speech.title',
    description: 'Audio speech recognition title',
  },
});

const Check = ({
  intl,
  enabled,
  speech,
}) => {
  const onChange = (e) => {
    const { checked } = e.target;
    SpeechService.setSpeech(checked);
  };

  if (!enabled) return null;

  return (
    <div style={{ padding: '1rem 0' }}>
      <input
        id="speechCheckbox"
        type="checkbox"
        onChange={onChange}
        checked={speech}
      />
      <label
        htmlFor="speechCheckbox"
        style={{ padding: '0 .5rem' }}
      >
        {intl.formatMessage(intlMessages.title)}
      </label>
    </div>
  );
};

Check.propTypes = {
  enabled: PropTypes.bool.isRequired,
  speech: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(Check);
