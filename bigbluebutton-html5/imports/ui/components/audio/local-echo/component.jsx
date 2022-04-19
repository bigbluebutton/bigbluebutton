import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from '../audio-test/styles';
import Settings from '/imports/ui/services/settings';
import Service from '/imports/ui/components/audio/local-echo/service';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  stream: PropTypes.shape({
    active: PropTypes.bool,
    id: PropTypes.string,
  }),
  initialHearingState: PropTypes.bool,
};

const defaultProps = {
  stream: null,
  initialHearingState: false,
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

const LocalEcho = ({
  intl,
  stream,
  initialHearingState,
}) => {
  const loopbackAgent = useRef(null);
  const [hearing, setHearing] = useState(initialHearingState);
  const { animations } = Settings.application;
  const icon = hearing ? 'mute' : 'unmute';
  const label = hearing ? intlMessages.stopHearingYourselfLabel : intlMessages.hearYourselfLabel;

  const applyHearingState = (_stream) => {
    if (hearing) {
      Service.playEchoStream(_stream, loopbackAgent.current);
    } else {
      Service.deattachEchoStream();
    }
  };

  const cleanup = () => {
    if (loopbackAgent.current) loopbackAgent.current.stop();
    Service.deattachEchoStream();
  };

  useEffect(() => {
    if (Service.useRTCLoopback()) {
      loopbackAgent.current = Service.createAudioRTCLoopback();
    }
    return cleanup;
  }, []);

  useEffect(() => {
    applyHearingState(stream);
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
};

LocalEcho.propTypes = propTypes;
LocalEcho.defaultProps = defaultProps;

export default injectIntl(React.memo(LocalEcho));
