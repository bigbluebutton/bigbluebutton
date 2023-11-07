import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';
import { useState, useEffect } from 'react';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.audio.captions.speech.title',
    description: 'Audio speech recognition title',
  },
});

const GladiaOptions = ({
  intl,
  enabled,
  onChanged,
}) => {
  if (!enabled) return null;

  const [partial, setPartial] = useState(true);
  const [minUtterance, setMinUtterance] = useState(3);

  const updateSpeechOptions = (p, mu) => {
    console.log("update");
    onChanged(p, parseInt(mu));
  };

  const renderTogglePartial = () => {
    return <Styled.ClosedCaptionsToggleContainer>
      <label>Partial utterances</label>
      <Styled.ClosedCaptionsToggle
        checked={partial}
        onChange={() => { console.log("partialaaaaa"); setPartial(!partial); updateSpeechOptions(!partial, minUtterance) }}
        icons={false}
        showToggleLabel={true}
      />
    </Styled.ClosedCaptionsToggleContainer>;
  };

  const renderPartialInterval = () => {
    return <Styled.ClosedCaptionsToggleContainer>
      <label>Min. Utterance Length</label>
      <input
        value={minUtterance}
        onChange={ (e) => { setMinUtterance(e.target.value); updateSpeechOptions(partial, e.target.value) }}
        type="number"
        max="5"
        min="0"
      >
      </input>
    </Styled.ClosedCaptionsToggleContainer>;
  };

  return <>
    <h3>Advanced Transcription Options</h3>
    {renderTogglePartial()}
    {partial ? renderPartialInterval() : null}
  </>;
};

GladiaOptions.propTypes = {
  enabled: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(GladiaOptions);
