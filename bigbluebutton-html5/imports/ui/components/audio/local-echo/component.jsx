import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from '../audio-test/styles';
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import {
  reloadAudioElement
} from '/imports/api/audio/client/bridge/service';

const MEDIA_TAG = Meteor.settings.public.media.mediaTag;

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  stream: PropTypes.object,
};

const defaultProps = {
  stream: null,
};

const intlMessages = defineMessages({
  hearYourselfLabel: {
    id: 'app.audio.hearYourselfLabel',
    description: 'Hear yourself button label',
  },
  stopHearingYourselfLabel: {
    id: 'app.audio.stopHearingYourselfLabel',
    description: 'Stop hearing yourself button label',
  },
});

const deattachEchoStream = () => {
  const audioElement = document.querySelector(MEDIA_TAG);
  audioElement.pause();
  audioElement.srcObject = null;
}

const playEchoStream = (stream) => {
  if (stream) {
    const audioElement = document.querySelector(MEDIA_TAG);
    deattachEchoStream();
    audioElement.srcObject = stream;
    audioElement.play();
  }
}

const LocalEcho = ({
  intl,
  stream,
}) => {
  const [hearing, setHearing] = useState(true);
  const { animations } = Settings.application;
  const icon = hearing ? "mute" : "unmute";
  const label = hearing ? intlMessages.stopHearingYourselfLabel : intlMessages.hearYourselfLabel;

  const applyHearingState = () => {
    if (hearing) {
      playEchoStream(stream);
    } else {
      deattachEchoStream();
    }
  };

  useEffect(() => {
    return deattachEchoStream;
  }, [])

  useEffect(() => {
    applyHearingState();
  }, [stream, hearing]);

  return (
    <Styled.TestAudioButton
      label={intl.formatMessage(label)}
      icon={icon}
      size="sm"
      color="primary"
      onClick={() => setHearing(!hearing)}
      animations={animations}
    />
  );
}

LocalEcho.propTypes = propTypes;
LocalEcho.defaultProps = defaultProps;

export default injectIntl(React.memo(LocalEcho));
